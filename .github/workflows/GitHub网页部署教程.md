# GitHub 网页部署教程

这个工作流会把仓库里的 `public/` 目录发布到 GitHub Pages。它是最简单的网页部署方式，适合当前这个项目的前端页面。

## 先决条件

1. 仓库必须已经推送到 GitHub。
2. 默认分支最好叫 `main`。
3. `public/index.html` 必须是站点入口。

## 在 GitHub 网页上操作

1. 打开你的仓库主页。
2. 点击右上角 `Settings`。
3. 左侧找到 `Pages`。
4. 在 `Build and deployment` 里，把 `Source` 选择为 `GitHub Actions`。
5. 回到仓库首页，确认 `.github/workflows/deploy-pages.yml` 已经提交到仓库。
6. 点击顶部 `Actions`。
7. 找到名为 `Deploy GitHub Pages` 的工作流，打开它。
8. 如果页面显示正在运行，就等待它完成。
9. 运行成功后，回到 `Settings -> Pages`，会看到站点地址。
10. 打开那个地址，就能看到部署后的网页。

## 如何重新部署

1. 修改代码后，直接提交到 `main` 分支。
2. GitHub Actions 会自动重新构建并发布。
3. 如果想手动部署，进入 `Actions`，选择 `Deploy GitHub Pages`，点击 `Run workflow`。

## 常见问题

1. 如果页面是 404，先检查 `Settings -> Pages` 是否已经选择了 `GitHub Actions`。
2. 如果工作流失败，先看 `Actions` 里的日志，最常见原因是依赖安装失败或构建命令报错。
3. 这个方案只发布静态页面，不会运行 `server.js`。如果你要把后端也一起部署，需要换成支持 Node 服务的主机。