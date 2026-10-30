# startup-os 更新命令與更新鏈（`/startup-os:update`）：設計與實作報告（2026-10-30）

> **文件性質**：已建成功能的設計說明與驗收報告。全部改動只在程式副本（會話暫存資料夾 `upd/dev`、`upd/tests/prototype`），**未換入** `prototypes/proofread/`、`tests/prototype/`、插件正式版；未提交版本控制。
> **起因**：安裝命令遇到已有 `startup-os/` 就拒絕（結束碼 2），已安裝的創辦人沒有任何辦法取得新版程式；在 Claude Code 更新插件只換插件資料夾，不會改項目內的副本。
> **硬約束**：`startup-os/data/` 一個檔都不改；只用 Node 內建模組；寫入前先停等創辦人答「好」；中途失敗不留半套；可還原上一個版本。
> **已核實現況**（讀過副本程式與測試、跑過測試）：安裝命令以暫存資料夾加改名寫入；伺服器開機見到同一資料夾的舊版且沒有工作進行中會關掉它改用新版；外殼 `run.mjs` 以 `data/ledger/.lock` 保證一次只做一個 run；插件附帶的 `program/` 由 `build-plugin.mjs` 生成並寫 `MANIFEST.sha256`；安裝命令從 `program/` 安裝時會把 `MANIFEST.sha256` 一併複製到 `startup-os/`（安裝資料夾因此自帶「已知程式檔清單」）；0.30 備份與現行 0.31 的插件版本號同為 `0.4.0`，只有伺服器版本字串（`SERVER_VERSION`）由 0.30 變 0.31。

---

## 0. 一頁講完

- **創辦人體驗**：在項目的 AI 對話輸入 `/startup-os:update`。AI 先檢查，已是最新就一句講完；有新版就原文印一句「將更新 `<項目根>\startup-os\` 內的 N 個程式檔（版本 A → B），並重新生成 VERSION、START-HERE.md 和排程啟動檔；舊版會先備份到 `…\.backup-A`；不會改動 `…\data`。」再問「好嗎？」，答「好」才寫入。完成後講新版本號、備份位置、`data/` 沒有改動，下一步打開 Founder Desk。新版有問題，輸入「還原上一個版本」，同樣先問後做。
- **資料安全**：`data/` 不被讀寫（只在更新期間借用外殼的鎖檔擋住排程，用完即刪）；舊版整份備份並逐檔核對；換入後逐檔對清單核對；任何一步失敗就由備份還原並逐檔核對；還原上一個版本同樣逐檔核對；創辦人自己放進 `startup-os/` 的檔不會刪；只刪舊清單列明而新版已沒有的程式檔。
- **版本規則**：更新命令比較安裝資料夾的 `VERSION` 與插件資訊檔 `.claude-plugin/plugin.json` 的版本號（`VERSION` 本來就由它生成）。**每次推出新版程式都必須提高 `plugin.json` 與 `marketplace.json` 的版本號**，否則更新命令會說「已是最新」（命令會另印一句提醒）。`SERVER_VERSION` 仍只用於開頁時換掉同一資料夾的舊版伺服器，與更新判斷無關。
- **測試**：新增「更新」測試 32 項全過（更新命令由插件附帶的 `program/update.mjs` 執行，與真實安裝同一路徑）；受影響的「安裝」17/17、「插件打包」12/12 全過（副本上以 `--proto` 指向副本跑，未碰正式版）。
- **要創辦人／換入會話決定**：(a) 換入時把 `plugin.json`、`marketplace.json` 版本號提到 `0.5.0`（本次副本未改，仍是 `0.4.0`）；(b) 是否接受「更新期間借用 `data/ledger/.lock`」這個唯一會碰到 `data/` 的動作（見第 4 節第 3 點）。

---

## 1. 建了甚麼（副本內的檔案清單）

| 路徑（相對程式副本 `dev/`） | 動作 | 內容 |
|---|---|---|
| `update.mjs` | 新增 | 更新命令核心：檢查／更新／還原；版本比較、暫存核對、備份、逐檔換入、刪舊程式檔、清單核對、失敗還原、關閉開着的舊版伺服器 |
| `bundle-rules.mjs` | 修改 | 新增安裝與更新共用的：`compareVersions`、`GENERATED`（生成檔名單）、`writeGenerated`（VERSION、START-HERE.md、排程啟動檔，同一套絕對路徑）、`manifestOf`、`parseManifest`、`sha256` |
| `install.mjs` | 修改 | 生成檔改用 `writeGenerated`（行為不變，安裝測試 17/17）；已安裝而版本舊過插件時，結束碼 2 的訊息改為指去 `/startup-os:update` |
| `start-here-template.md` | 修改 | 入口加 `/startup-os:update`；「程式更新（過渡做法）」改為實際做法（備份、核對、可自行刪除 `.backup-` 資料夾） |
| `adapters/claude-code/startup-os/skills/update/SKILL.md` | 新增 | 第四個指令（轉接層）：檢查 → 原文印一句並停 → 答「好」才 `--apply`；「還原上一個版本」同一模式 |
| `adapters/claude-code/startup-os/skills/install/SKILL.md` | 修改 | 已安裝時提示可用 `/startup-os:update`；結束碼 2 的分支照命令印出的提示講 |
| `adapters/claude-code/startup-os/.claude-plugin/plugin.json` | 修改 | 描述加入 `/startup-os:update`（版本號未改） |
| `adapters/claude-code/startup-os/program/` | 重新生成 | 用副本的 `build-plugin.mjs` 重跑：92 個程式檔（含 `update.mjs`）＋ `MANIFEST.sha256` |

| 路徑（相對測試副本 `tests/prototype/`） | 動作 | 內容 |
|---|---|---|
| `core/update-test.mjs` | 新增 | 更新測試（第 5 節）；把副本的 `adapters/claude-code/startup-os/` 複製到輸出資料夾，由那裏的 `program/update.mjs` 執行（旁邊有 `MANIFEST.sha256`，與真實安裝同一路徑），並先核對 `program/` 與原型同步 |
| `core/plugin-bundle-test.mjs` | 修改 | 指令清單由三個改四個；加 update 技能內容檢查與 `program/update.mjs` 存在檢查 |
| `run-all.mjs` | 修改 | 登記「更新」測試（排在「插件打包」之後） |
| `README.md` | 修改 | 測試清單加「更新」及 `SOS_TEST_OLD` 說明 |

另一份文件：本文（`docs/plan/DESIGN-update-chain-2026-10-30.md`）。

---

## 2. 命令介面（`update.mjs`）

| 命令 | 寫入 | 結束碼 |
|---|---|---|
| `node update.mjs <項目根>` | 否 | 0 已是最新（或版本相同）；3 有新版，已印固定一句；2 未安裝；4 AI 工作進行中；1 其他（已安裝版本比插件新、插件損壞、找不到項目資料夾） |
| `node update.mjs <項目根> --apply` | 是 | 0 完成；4 AI 剛開始工作（沒改任何檔）；1 未完成（已由備份還原，或還原不完整並印出備份位置） |
| `node update.mjs <項目根> --rollback` | 否 | 3 有備份，已印固定一句；1 沒有備份／備份不完整；4 AI 工作進行中 |
| `node update.mjs <項目根> --rollback --apply` | 是 | 0 已還原；1 未完成（印出不符的檔與備份位置） |

技能只做轉接：先跑檢查，把命令印出的那句原文給創辦人，問「好嗎？」，停；答「好」才加 `--apply`。檢查與寫入是兩次獨立執行，第二次仍會重新做全部安全檢查。

更新時的次序（`--apply`）：

1. 開頁探測：掃描 `BASE_PORT` 起 10 個埠的 `/api/status`，找同一 `data/` 的伺服器；任何一個 `busy`，或 `data/ledger/.lock` 仍在 20 分鐘內，即結束碼 4，不寫。
2. 取外殼的鎖 `data/ledger/.lock`（與 `run.mjs` 同一規則；`data/ledger/` 不存在就不取）。排程器或頁面在這段時間叫起的 `run.mjs` 會因取不到鎖而自動跳過，不會跑到一半新一半舊的程式。
3. 新版先複製到項目根的 `.startup-os-updating-<pid>/`（程式檔、生成檔、`MANIFEST.sha256`），逐檔核對。
4. 舊版備份到 `startup-os/.backup-<舊版本>/`（`data/` 與其他備份以外的全部檔，包括創辦人自己放入的檔），逐檔核對。備份資料夾已存在就另起 `.backup-<舊版本>-2`、`-3`，永不覆寫。
5. 逐檔覆寫到 `startup-os/`（不改名整個資料夾：開着的伺服器把工作目錄放在 `startup-os/` 內，改名會失敗；Node 載入 `.mjs` 後不鎖檔，逐檔覆寫可行）。再刪「舊 `MANIFEST.sha256` 列明、新版沒有、不是生成檔、不在 `data/`」的舊程式檔，順手清空的父資料夾。
6. 逐檔核對：每個程式檔對新清單，生成檔對暫存。
7. 任何一步拋錯：已開始覆寫就由備份還原（備份每檔抄回、新版新增的檔刪走、逐檔核對），核對一致即刪備份與暫存，結束碼 1 並講明已還原；未開始覆寫就只刪暫存與備份。
8. 成功：刪暫存、放鎖、關閉第 1 步找到的（閒置）伺服器，印結果與下一步。

還原（`--rollback --apply`）：取最近一次（修改時間最新）的 `.backup-*`，每檔抄回、刪「現時 `MANIFEST.sha256` 列明或生成檔、備份沒有」的檔、逐檔核對；備份資料夾保留。

---

## 3. 版本規則

- **比較甚麼**：安裝資料夾 `VERSION`（安裝／更新時由插件資訊檔 `.claude-plugin/plugin.json` 的 `version` 生成）對插件 `program/` 旁邊同一個 `plugin.json`。三節數字逐節比較（`compareVersions`）。
- **判斷**：安裝版本較舊 → 可更新；相同 → 已是最新（命令會另印「有 N 個程式檔與插件不同但版本號相同；要推出新版，請先提高插件版本號」提醒開發者）；安裝版本較新 → 拒絕，不會改成舊版。
- **發佈規則**：每次重跑 `build-plugin.mjs` 推出新程式，必須先提高 `adapters/claude-code/startup-os/.claude-plugin/plugin.json` 與 `adapters/claude-code/.claude-plugin/marketplace.json` 的版本號（插件打包測試已檢查兩者一致）。沒有機器強制「程式變了版本號必須跟着變」，只有上述提醒句；原因：清單格式（`MANIFEST.sha256`）不記版本號，加記會改現有測試的解析，本次不擴。
- **`SERVER_VERSION`（`ask-lib.mjs`，現為 `proofread-chain-0.31`）**：只用於開頁時換掉同一資料夾的舊版伺服器，不參與更新判斷。更新命令不管它是否有變，都會在成功後關閉找到的閒置伺服器，所以即使某次發佈沒改 `SERVER_VERSION`，下次打開 Founder Desk 也一定是新版。

---

## 4. 資料安全保證與對應測試

| 保證 | 怎樣做到 | 測試（`core/update-test.mjs` 項目名） |
|---|---|---|
| `data/` 內容不變 | 更新與還原的檔案清單都跳過 `data/`；備份不含 `data/`；刪檔名單排除 `data/` | 「更新後 data/ 逐檔雜湊不變（連資料夾都冇多冇少）、冇留低鎖」「失敗後 data/ 逐檔不變…」「還原冇改 data/…」「還原後再更新…`same(tree(DATA))`」 |
| 唯一碰到 `data/` 的動作只是借用鎖 | 只在 `data/ledger/` 已存在時以 `wx` 建 `.lock`，`finally` 刪除；刪前核對內容是自己的 pid | 每個寫入案例後檢查 `!fs.existsSync(LOCK)`；data/ 樹快照前後一致 |
| 寫入前先問、檢查不寫 | 檢查模式只讀；技能規定答「好」才 `--apply` | 「檢查冇寫任何嘢：安裝資料夾雜湊不變、冇備份、項目根冇暫存資料夾」「還原檢查…冇寫任何嘢」；插件打包測試檢查技能含 `--apply`、「好嗎」、「還原上一個版本」 |
| 舊版整份備份且不覆寫舊備份 | 複製後逐檔核對；名稱碰撞另起 `-2` | 「備份資料夾有舊版全部檔（data/ 以外，含創辦人嘅檔）、逐檔雜湊同更新前一致」「還原後再更新：…舊備份原封不動、新備份另起 .backup-0.3.0-2」 |
| 換入後逐檔核對新清單 | 每個程式檔 sha256 對 `manifestOf(新程式)`；安裝資料夾的 `MANIFEST.sha256` 即新清單 | 「每個程式檔同新版清單雜湊一致，安裝資料夾嘅 MANIFEST.sha256 就係新清單」「VERSION 係新版本」 |
| 失敗不留半套 | 任何一步拋錯即由備份還原並核對 | `SOS_UPDATE_FAIL_AFTER=7`：「換入第 7 個檔之後故意失敗：結束碼 1、講已由備份還原」「失敗後安裝資料夾逐檔雜湊同更新前一模一樣（含 VERSION、創辦人嘅檔、舊程式檔；冇留低備份）」 |
| 不刪創辦人的檔；只刪已知舊程式檔 | 刪檔名單只來自舊 `MANIFEST.sha256`；沒有舊清單就一個都不刪 | 「新版已冇嘅舊程式檔（舊清單列明）已刪；創辦人自己放入嘅兩個檔原封不動」（`my-notes.md`、`fixtures/my-own.txt`、`old-only.mjs`）；還原後「創辦人嘅檔仍在、新版新增嘅檔已刪」 |
| 排程啟動檔仍有效 | `writeGenerated` 用同一套絕對路徑（現行 `process.execPath`、`startup-os/run.mjs`） | 「排程啟動檔重新生成：絕對路徑指住存在嘅執行環境同同一資料夾嘅 run.mjs」 |
| 開着的伺服器處理得到 | 忙碌即拒絕；閒置則逐檔覆寫後關閉它 | 先以舊版 `ask.mjs --desk` 開伺服器：「檢查時講明 Founder Desk 開着」「更新：…已關閉舊版 Founder Desk」「舊版伺服器已經唔再運行」；還原同樣關閉新版伺服器 |
| 更新後舊資料照用 | 不碰資料；舊格式由既有遷移碼在首次開頁／首次 run 處理 | 「更新後打開 Founder Desk：新版伺服器、同一個 data/」「新版讀到舊安裝嘅公司資料（公司概覽同監察台都有公司名）」（夾具 `old-install.mjs`：舊格式公司概覽、成頁確認、封存） |
| AI 工作進行中不更新 | 伺服器 `busy` 或鎖在 20 分鐘內 → 結束碼 4 | 「AI 工作進行中（有鎖）：檢查同 --apply 都結束碼 4、冇改任何檔」 |
| 已是最新／未安裝／版本倒置 | 版本比較；`ask.mjs` 不存在即未安裝 | 「已是最新：…一個檔都唔改」「已安裝版本比插件新：拒絕」「未安裝：結束碼 2，指去 /startup-os:install」「舊版上再執行安裝命令：拒絕並指去 /startup-os:update」 |

---

## 5. 測試結果（副本，`--proto` 指向副本；2026-10-30）

命令：`node <upd>\tests\prototype\run-all.mjs --proto <upd>\dev --out <upd>\out-runall --no-browser --only 安裝,插件打包,更新`（環境變數 `SOS_TEST_OLD` 指向 0.30 備份的 `adapters/claude-code/startup-os`，只讀）。

| 測試 | 結果 |
|---|---|
| 安裝 | 17/17 |
| 插件打包 | 12/12（含新加的「四個指令齊」「update 技能」檢查；插件資料夾零本機路徑） |
| 更新 | 32/32 |

「更新」測試另外在沒有 `SOS_TEST_OLD`（由原型合成舊版）下直接跑過一次：32/32。

審閱時找到並修正的一個缺陷：插件附帶的 `MANIFEST.sha256` 由 `build-plugin.mjs` 以不帶安裝排除清單的檔案清單生成，因此列有 `開始.cmd`、`start-here-template.md` 兩個不安裝的開發用檔；更新命令核對「插件程式檔與清單一致」時原本把它們當作不符而拒絕執行（由 `program/` 執行時必定出現）。已改為核對時略過 `INSTALL_SKIP` 的名稱，並把測試改為由 `program/update.mjs` 執行以覆蓋這條真實路徑。

舊版來源：測試把 0.30 備份的插件資料夾複製到輸出資料夾，把副本的版本號改為 `0.3.0` 再用它的 `program/install.mjs` 安裝（0.30 與 0.31 的插件版本號同為 `0.4.0`，不改就無法走更新路徑）；`data/` 以 `fixtures/old-install.mjs` 放入真實格式的舊資料。

---

## 6. 已知限制與未核實事項

- **版本號沒有機器強制**：程式變了而 `plugin.json` 沒提高，更新命令會說已是最新（附提醒句）。換入時要人手提版本號（本次副本未提）。
- **借用鎖**：更新期間 `data/ledger/.lock` 由更新命令持有約一秒；若更新程序被硬殺，鎖會留下，`run.mjs` 20 分鐘後自行清走（既有規則）。這是唯一會在 `data/` 內建檔的動作，用完即刪。
- **AI 設定認證中**：伺服器的 `busy` 只反映外殼工作，不包括「設定 AI」的認證程序；若剛好在認證中更新，閒置判斷會關掉伺服器、認證中止，創辦人重按一次即可。未另加測試。
- **還原到舊版後讀新版寫過的資料**：還原不碰 `data/`，舊版程式讀新版格式的資料是否完全相容，視乎兩版之間的格式改動；本次未測。
- **備份只增不減**：每次更新多一個 `.backup-<版本>/`（約 1.3 MB），還原後也保留；`START-HERE.md` 已寫明可自行刪除。
- **非 Windows**：`run-schedule.sh` 的重新生成沿用安裝命令同一函數，但本次只在 Windows 跑過測試。
- **安裝資料夾的清單多兩個名**：從 `program/` 安裝或更新後，`startup-os/MANIFEST.sha256` 是插件的清單，列有 `開始.cmd`、`start-here-template.md` 兩個沒有安裝的檔；更新時刪舊程式檔只刪「實際存在」的，所以無影響。
- **沒有舊清單的安裝**：由開發原型（非插件 `program/`）直接安裝的資料夾沒有 `MANIFEST.sha256`，更新時不會刪任何舊程式檔（安全預設），更新後才有清單。未另加測試。
- **正式版未換入**：以上全部只在副本；換入時須重跑 `build-plugin.mjs` 再跑插件打包測試（第 1 節清單）。
