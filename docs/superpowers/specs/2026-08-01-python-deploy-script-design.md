# Python 发布脚本设计

## 目标

提供根目录命令 `./deploy.sh`，用一次执行完成项目校验、Git 提交和推送，从而触发 GitHub 关联的 Cloudflare Pages 发布。

## 结构

- 根目录 `deploy.sh` 是轻量入口，仅定位仓库目录并调用 `python3 scripts/deploy.py`。
- `scripts/deploy.py` 实现发布流程，所有外部命令都通过 Python `subprocess` 执行。
- `package.json` 的 `deploy` 命令调用根目录 `./deploy.sh`，确保两种入口行为一致。

## 发布流程

脚本从仓库根目录依次执行：

1. `npm test`
2. `npm run build`
3. `git add -A`
4. 检查暂存区是否存在改动
5. 使用固定消息 `chore: 发布网站` 创建提交
6. `git push`

如果暂存区没有改动，脚本输出提示并正常退出，不创建空提交。任一校验、Git 提交或推送命令失败时，脚本立即返回该命令的非零状态，不再执行后续步骤。

## 测试

为 Python 发布逻辑增加单元测试，通过注入命令执行器验证：

- 有改动时，各命令按规定顺序执行。
- 没有改动时，不执行提交和推送。
- 前置命令失败时，异常向上传递且后续命令不执行。

完成后运行 Python 单元测试、项目现有 `npm test` 和 `npm run build`。验证时不实际执行发布入口，以免产生真实提交或推送。
