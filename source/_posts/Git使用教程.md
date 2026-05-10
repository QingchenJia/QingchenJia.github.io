---
title: Git使用教程
typora-root-url: Git使用教程
date: 2026-05-10 12:50:44
tags:
    - Git
    - 版本控制
    - 教程
---

# Git 使用教程

Git 是目前最常用的分布式版本控制系统之一。它的价值不只是“保存代码历史”，更重要的是帮助你在多人协作、分支开发、版本回退、问题排查这些场景里保持清晰和可控。下面这篇教程会从最基础的概念讲起，逐步讲到日常开发中最常用的命令，并且给每一部分都配上合适的示例。

## 一、先理解 Git 在做什么

你可以把 Git 理解成一个“会记录每次改动的时间机器”。当你修改了项目里的某个文件，Git 会帮你记住改了什么、什么时候改的、是谁改的，以及这些改动属于哪个版本。

### 适合新手的理解方式

假设你正在编辑一个 `README.md` 文件：

- 第 1 天，你写下项目介绍。
- 第 2 天，你补充安装步骤。
- 第 3 天，你发现安装说明写错了，需要改回去。

如果没有 Git，你可能只能依赖手动备份；有了 Git，你可以随时回到第 2 天甚至第 1 天的版本。

### Git 和普通备份的区别

- 备份通常是“复制一份文件”。
- Git 是“记录每一次变化，并且能对比、合并、回退”。

例如，普通备份只能告诉你“这是旧文件”，Git 可以告诉你“这次把安装命令从 `npm install` 改成了 `pnpm install`”。

## 二、Git 的三个核心区域

学习 Git，最重要的是先搞懂三个区域：

- 工作区：你正在编辑的文件所在的地方。
- 暂存区：你已经确认，准备提交的改动。
- 本地仓库：已经正式保存下来的历史版本。

### 一个最直观的例子

假设你修改了 `index.html`：

1. 你在编辑器里改了内容，这时改动还在工作区。
2. 你执行 `git add index.html`，把改动放到暂存区。
3. 你执行 `git commit -m "feat: update homepage title"`，把改动写入本地仓库。

可以把它理解成下面这个流转过程：

```text
工作区  ->  git add  ->  暂存区  ->  git commit  ->  本地仓库
```

### 为什么要有暂存区

暂存区的作用是“允许你挑选要提交的内容”。

比如你同时修改了两个文件：

- `app.js`：加了新功能。
- `README.md`：补了说明文档。

如果你只想先提交文档，可以只执行：

```bash
git add README.md
git commit -m "docs: update usage guide"
```

这样就不会把还没写完的 `app.js` 一起提交进去。

## 三、安装 Git 并完成基础配置

### 1. 安装 Git

不同平台的安装方式不一样，但安装后都可以用同一个命令检查版本：

```bash
git --version
```

#### Windows

最简单的方式是去 Git 官网下载安装包；如果你习惯命令行，也可以直接使用：

```powershell
winget install --id Git.Git -e
```

安装完成后，再执行：

```bash
git --version
```

如果输出类似 `git version 2.45.2`，说明安装成功。

#### macOS

如果你使用 Homebrew，可以执行：

```bash
brew install git
```

#### Ubuntu / Debian

可以执行：

```bash
sudo apt update
sudo apt install git
```

### 2. 配置用户名和邮箱

Git 会把提交记录和用户名、邮箱关联起来，所以第一次使用时最好先配置身份信息。

```bash
git config --global user.name "Zhang San"
git config --global user.email "zhangsan@example.com"
```

这里的 `--global` 表示“对当前电脑上的所有仓库都生效”。

### 配置示例

如果你希望在公司项目和个人项目里使用不同身份，也可以不加 `--global`，在某个仓库单独配置：

```bash
git config user.name "Company Name"
git config user.email "dev@company.com"
```

这样只有当前仓库会使用这个身份。

### 3. 查看当前配置

配置完成后，可以检查一下：

```bash
git config --list
```

如果你想只看用户名或邮箱，也可以：

```bash
git config user.name
git config user.email
```

## 四、创建仓库或获取现有仓库

### 1. 初始化一个新仓库

当你要把一个新项目纳入 Git 管理时，使用：

```bash
git init
```

#### 示例

假设你正在创建一个静态网站项目：

```bash
mkdir my-site
cd my-site
git init
```

这时目录里会多出一个 `.git` 文件夹，它就是 Git 管理数据的核心位置。

### 2. 克隆一个远程仓库

如果项目已经在 GitHub、GitLab 或 Gitee 上，你通常不会手动初始化，而是直接克隆：

```bash
git clone https://github.com/example/demo.git
```

#### 示例

比如你想参与一个开源项目：

```bash
git clone https://github.com/redis/redis.git
cd redis
```

克隆完成后，你就拿到了完整历史、分支和远程地址。

### 3. 查看当前仓库状态

最常见、也最重要的命令之一是：

```bash
git status
```

#### 示例

如果你改了 `README.md`，但还没提交，`git status` 可能会显示：

```text
modified: README.md
```

如果有新文件还没加入 Git，可能会显示：

```text
Untracked files:
  new-file.md
```

`git status` 是每天都要反复看的命令，养成习惯非常重要。

## 五、最常用的日常提交流程

这是 Git 的核心工作流，也是你最应该熟练掌握的一部分。

### 1. 查看修改内容

在提交之前，先看看自己改了什么：

```bash
git diff
```

#### 示例

如果你把 `README.md` 里的安装命令从 `npm install` 改成了 `pnpm install`，`git diff` 会明确显示：

```diff
-npm install
+pnpm install
```

这样你在提交前就能确认改动是否符合预期。

### 2. 把文件放入暂存区

最常见的做法是把某个文件或某些文件加入暂存区：

```bash
git add README.md
```

如果要一次加入当前目录下所有改动，也可以：

```bash
git add .
```

#### 示例

假设你修改了下面这些内容：

- `index.html`
- `style.css`
- `README.md`

如果你只想先提交文档，可以只执行：

```bash
git add README.md
```

这样就能把提交粒度控制得更精细。

### 3. 提交改动

当暂存区准备好了，就可以提交：

```bash
git commit -m "docs: update installation instructions"
```

#### 提交信息建议

一个好的提交信息应该简洁、明确，最好能看出这次改动的类型。常见前缀包括：

- `feat`：新增功能
- `fix`：修复问题
- `docs`：文档修改
- `refactor`：重构
- `test`：测试相关

#### 示例

- `feat: add login form`
- `fix: correct redirect url`
- `docs: improve README usage examples`

这样的提交信息比“update”或“change”更容易回溯。

### 4. 查看提交历史

提交完成后，可以查看历史记录：

```bash
git log --oneline --graph --decorate --all
```

#### 示例

如果你的仓库有多个分支，这条命令会把分支关系画得更清楚。你可能会看到类似：

```text
* a1b2c3d (HEAD -> main) docs: update README
* e4f5g6h feat: add login page
* i7j8k9l init project
```

这种视图很适合理解项目的演进过程。

### 5. 推送到远程仓库

如果你已经配置好远程仓库，就可以把本地提交推上去：

```bash
git push origin main
```

#### 示例

第一次推送分支时，通常会加上 `-u` 建立跟踪关系：

```bash
git push -u origin main
```

这样以后你在这个分支上只需要执行：

```bash
git push
```

## 六、分支管理：让并行开发更安全

分支是 Git 最强大的功能之一。它让你可以在不影响主线的情况下，独立开发新功能、修复问题或做实验。

### 1. 查看本地分支

```bash
git branch
```

#### 示例

如果输出：

```text
* main
  feature/login
```

说明你当前在 `main` 分支，同时仓库里还有一个 `feature/login` 分支。

### 2. 创建并切换到新分支

推荐使用：

```bash
git switch -c feature/login
```

#### 示例

当你准备开发登录功能时，可以这样做：

```bash
git switch -c feature/login
```

这样你就在一个独立分支里修改，不会直接影响主分支。

### 3. 切换到已有分支

```bash
git switch main
```

#### 示例

如果你在 `feature/login` 分支上开发到一半，需要先回主分支修一个紧急问题，就可以执行：

```bash
git switch main
```

### 4. 合并分支

当功能开发完成后，可以把分支合并回主分支：

```bash
git merge feature/login
```

#### 示例

假设 `feature/login` 已经完成登录页和表单校验，你回到主分支后执行：

```bash
git switch main
git merge feature/login
```

如果没有冲突，Git 会自动完成合并。

### 5. 删除已合并的分支

```bash
git branch -d feature/login
```

#### 示例

如果 `feature/login` 已经成功合并，分支就不再需要保留，可以安全删除。

如果你确定要强制删除，可以使用：

```bash
git branch -D feature/login
```

但强制删除要谨慎，因为它可能丢掉未合并的提交。

## 七、处理冲突：多人协作时很常见

当两个人改了同一文件的同一部分，Git 无法自动决定保留哪一版，就会出现冲突。

### 冲突长什么样

Git 会在文件里插入冲突标记：

```text
<<<<<<< HEAD
当前分支内容
=======
另一个分支内容
>>>>>>> feature/login
```

### 示例

假设你和同事都修改了 `README.md` 的安装说明：

```text
<<<<<<< HEAD
npm install
=======
pnpm install
>>>>>>> feature/login
```

这时你需要手动决定保留哪一版，或者把两者合并成你真正想要的内容，例如：

```text
npm install
# 或者按项目要求改成 pnpm install
```

### 冲突处理步骤

1. 执行 `git status` 查看哪些文件冲突了。
2. 打开冲突文件，手动修改内容。
3. 删除冲突标记。
4. 执行 `git add` 标记已解决。
5. 最后提交合并结果。

#### 示例命令

```bash
git status
git add README.md
git commit -m "merge: resolve conflict in README"
```

## 八、撤销修改与回退版本

这一部分非常重要，但也最容易误用。你需要先分清楚：你是想撤销“未提交的修改”，还是想回退“已经提交的版本”。

### 1. 撤销工作区里未提交的修改

如果你刚改了文件，但还没 `add`，想放弃这些改动，可以用：

```bash
git restore README.md
```

#### 示例

如果你把 `README.md` 里的一段说明改错了，且还没提交，执行上面的命令就会回到最近一次提交的状态。

### 2. 撤销已经加入暂存区的修改

如果你已经执行了 `git add`，但突然发现不想提交它了，可以先把它从暂存区移除：

```bash
git restore --staged README.md
```

#### 示例

你本来想提交 `README.md`，结果误把一个临时配置文件也加进去了，就可以用这条命令先撤回暂存。

### 3. 回退到上一个提交

`git reset` 有三种常见模式：

```bash
git reset --soft HEAD~1
git reset --mixed HEAD~1
git reset --hard HEAD~1
```

#### 它们的区别

- `--soft`：只回退提交，改动还保留在暂存区。
- `--mixed`：回退提交，改动保留在工作区，但不在暂存区。
- `--hard`：回退提交，并且直接丢弃工作区和暂存区的改动。

#### 示例

如果你刚提交了一条信息，但发现提交内容还没整理好：

```bash
git reset --soft HEAD~1
```

这样你可以在保留改动的情况下重新整理再提交。

如果你只是想彻底放弃本地改动，可以使用：

```bash
git reset --hard HEAD~1
```

但这条命令风险较大，执行前一定要确认你真的不需要这些内容了。

### 4. 用反向提交撤销历史

如果某个提交已经推到远程仓库，通常更推荐使用：

```bash
git revert <commit-id>
```

#### 示例

假设某次提交把线上配置改错了，但其他人已经拉取了这条历史，这时不要轻易 `reset --hard` 改写历史，而应该执行：

```bash
git revert a1b2c3d
```

这样 Git 会生成一个新的提交，用来“反向抵消”那次改动。

### 5. 误操作后的救命命令

如果你执行了比较激进的回退命令，想找回之前的状态，可以看：

```bash
git reflog
```

#### 示例

`reflog` 会记录你本地 HEAD 的移动历史。比如你看到某个状态对应：

```text
HEAD@{2}: reset: moving to HEAD~1
```

你就可以把仓库恢复到那个位置：

```bash
git reset --hard HEAD@{2}
```

这条命令非常适合“误操作后救火”，尤其是本地还没推送的时候。

## 九、远程仓库的常用操作

### 1. 查看远程仓库地址

```bash
git remote -v
```

#### 示例

你可能会看到类似：

```text
origin  https://github.com/example/demo.git (fetch)
origin  https://github.com/example/demo.git (push)
```

这说明当前仓库绑定了名为 `origin` 的远程地址。

### 2. 添加远程仓库

如果本地仓库还没有远程地址，可以手动添加：

```bash
git remote add origin https://github.com/example/demo.git
```

#### 示例

你刚执行了 `git init`，想把项目推到 GitHub，就可以先添加远程地址，再推送。

### 3. 首次推送并建立跟踪关系

```bash
git push -u origin main
```

#### 示例

第一次把本地 `main` 分支推到远程时，建议用这条命令。这样以后再推送时，只需要：

```bash
git push
```

### 4. 拉取远程更新

如果远程已经有人更新了代码，你可以先拉取再合并：

```bash
git pull
```

更稳妥的方式通常是：

```bash
git pull --rebase
```

#### 示例

假设同事已经把 `main` 分支更新了，你本地也在改同一个项目。为了减少无意义的合并提交，你可以先执行：

```bash
git pull --rebase origin main
```

### 5. 只获取，不立即合并

如果你只是想先看看远程更新了什么，可以用：

```bash
git fetch origin
```

#### 示例

执行后，你可以对比本地和远程分支：

```bash
git log --oneline main..origin/main
```

这样能先看差异，再决定是否合并。

## 十、临时保存现场：stash

有时候你正在开发一个功能，但临时要切到别的分支修 bug。此时当前改动还没完成，不适合直接提交。`stash` 就是为这种情况准备的。

### 1. 保存当前改动

```bash
git stash push -m "wip: unfinished login page"
```

#### 示例

你正在写登录页，但老板突然让你先修首页样式。你可以先把当前改动收起来：

```bash
git stash push -m "wip: login page"
```

### 2. 查看暂存记录

```bash
git stash list
```

#### 示例

你可能会看到：

```text
stash@{0}: On feature/login: wip: login page
```

### 3. 取回暂存的改动

```bash
git stash pop
```

#### 示例

当你修完紧急问题回到原任务后，执行 `git stash pop` 就能把之前保存的改动恢复回来。

### 4. 只查看不弹出

如果你想先确认暂存里的改动是什么，可以用：

```bash
git stash show -p
```

这样你能在恢复前先确认内容是否正确。

## 十一、标签：给重要版本打标记

标签常用于发布版本，例如 `v1.0.0`、`v2.1.3`。

### 1. 创建普通标签

```bash
git tag v1.0.0
```

#### 示例

当项目完成第一个可用版本时，你可以给它打一个简单标签：

```bash
git tag v1.0.0
```

### 2. 创建附注标签

```bash
git tag -a v1.0.0 -m "release version 1.0.0"
```

#### 示例

附注标签更适合正式发布，因为它能记录说明信息，比如：

```bash
git tag -a v1.0.0 -m "first stable release"
```

### 3. 推送标签到远程

```bash
git push origin v1.0.0
```

或者一次性推送全部标签：

```bash
git push origin --tags
```

#### 示例

当你发布一个正式版本后，最好把标签也同步到远程仓库，方便团队统一查看。

## 十二、.gitignore：告诉 Git 忽略什么

并不是项目里的所有文件都应该纳入版本控制。像依赖目录、编译产物、临时日志、敏感配置，通常都应该忽略。

### 示例 .gitignore

```gitignore
node_modules/
dist/
.env
*.log
.DS_Store
```

### 解释

- `node_modules/`：依赖目录，通常可以重新安装，不必提交。
- `dist/`：构建产物，通常由源码生成。
- `.env`：环境变量文件，常含敏感信息。
- `*.log`：日志文件。
- `.DS_Store`：macOS 生成的系统文件。

### 示例

如果你的 Node 项目里已经有 `node_modules/`，但你不想把它提交到仓库，只要把它写进 `.gitignore`，Git 就会自动忽略它。

## 十三、查看作者、定位修改和排查问题

除了提交和分支，Git 还有一些非常实用的“排障命令”。

### 1. 查看某一行是谁改的

```bash
git blame README.md
```

#### 示例

如果你想知道 `README.md` 里某一句说明是谁改的、哪次提交改的，`git blame` 非常有用。

### 2. 查看某次提交做了什么

```bash
git show <commit-id>
```

#### 示例

如果你在历史里看到一个可疑提交 `a1b2c3d`，可以执行：

```bash
git show a1b2c3d
```

它会显示这次提交修改了哪些文件、改了哪些行。

### 3. 比较两个版本的区别

```bash
git diff HEAD~1 HEAD
```

#### 示例

这条命令很适合回答“上一个版本和当前版本到底改了什么”这个问题。

## 十四、一个完整的实战流程

下面给出一个从开发功能到推送合并的完整示例。

### 场景

你要给网站新增一个搜索功能。

### 操作步骤

```bash
git switch -c feature/search
```

然后你开始修改代码，比如新增 `search.js`，并调整 `README.md`。

```bash
git status
git diff
git add search.js README.md
git commit -m "feat: add search feature"
git pull --rebase origin main
git push -u origin feature/search
```

### 这套流程的意义

- 先建分支，保证主分支稳定。
- 先看差异，避免提交错误内容。
- 再提交，保证历史清晰。
- 推送前先 rebase，减少冲突和多余合并提交。
- 最后通过 Pull Request 或 Merge Request 进入主分支。

## 十五、建议你优先掌握的 Git 命令

如果你是第一次系统学习 Git，建议优先掌握下面这些命令：

```bash
git status
git diff
git add
git commit
git log
git branch
git switch
git merge
git restore
git reset
git pull
git push
git stash
git reflog
```

### 学习顺序建议

1. 先理解 Git 的三个区域。
2. 再熟练使用 `status`、`add`、`commit`、`log`。
3. 接着学习分支、合并和冲突解决。
4. 然后掌握撤销、回退和 `reflog`。
5. 最后补上远程仓库、`stash` 和标签。

## 十六、总结

Git 的学习重点，不是把命令死记硬背，而是弄清楚“我现在在哪个区域、我要把改动推进到哪一步、出了问题该怎么安全撤回”。只要你真正理解了工作区、暂存区、本地仓库这三层结构，再配合 `status`、`add`、`commit`、`branch`、`merge`、`restore`、`reset` 这些常用命令，日常开发基本就能应付自如。

如果你愿意，可以把这篇教程当作 Git 的第一份速查手册，边做项目边回来看。实际使用几轮之后，你会发现 Git 最难的不是命令本身，而是对“版本变化”这件事的整体理解。一旦这个理解建立起来，后面的操作都会顺很多。
