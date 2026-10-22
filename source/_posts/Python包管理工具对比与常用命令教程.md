---
title: Python包管理工具对比与常用命令教程
typora-root-url: Python包管理工具对比与常用命令教程
date: 2026-10-22 12:36:52
categories:
    - 开发工具
tags:
    - Python
    - 包管理
---

### 一、先分清这些工具在管理什么

Python 开发中，安装一个 `requests` 并不难，真正容易混乱的是：包安装到了哪个 Python、如何隔离多个项目、怎样让同事安装相同依赖，以及如何升级后仍能复现环境。

`pip`、`uv`、`Poetry` 等工具都与包有关，但负责的范围不同。先理解几个概念，再选择工具会更清楚：

- **包仓库**：例如 PyPI，负责托管 Python 包；它不是本机的包管理命令。
- **虚拟环境**：隔离项目依赖的目录，避免不同项目互相影响；`venv` 主要负责创建它。
- **依赖声明**：记录项目主动需要哪些包和版本范围，例如 `requests>=2.31,<3`。
- **锁定文件**：记录解析后的具体依赖版本，通常还包含来源、哈希或平台条件，帮助重复安装。

| 工具          | 主要定位                          | 常见依赖文件                          | 更适合的需求              |
| ------------- | --------------------------------- | ------------------------------------- | ------------------------- |
| pip           | Python 包安装器                   | `requirements.txt` 等                 | 基础安装、教程、已有项目  |
| uv            | Python 版本、环境、依赖与项目管理 | `pyproject.toml`、`uv.lock`           | 新项目、自动化、团队协作  |
| pip-tools     | 为 pip 工作流解析和固定依赖       | `requirements.in`、`requirements.txt` | 保留 requirements 工作流  |
| Poetry        | 项目依赖、打包与发布管理          | `pyproject.toml`、`poetry.lock`       | Python 库、规范化项目     |
| Pipenv        | 应用依赖与虚拟环境管理            | `Pipfile`、`Pipfile.lock`             | 已采用 Pipenv 的应用项目  |
| Conda / Mamba | Python 与非 Python 包、环境管理   | `environment.yml` 等                  | 科学计算、复杂二进制依赖  |
| pipx          | 隔离安装 Python 命令行应用        | 通常不维护项目依赖文件                | 安装 Poetry、Black 等工具 |

**新建常规项目可以优先考虑 uv；学习基础和维护旧项目需要掌握 pip；已有团队项目优先沿用其约定。** 数据科学项目是否使用 Conda，应根据底层依赖判断，不能只凭“做机器学习”就认定必须使用它。

以下以 Windows PowerShell 为主要终端，基础示例使用 Python 3.12；这是示例版本，可以换成项目实际支持的版本。每个工具的小节是独立示例，进入新的终端和目录操作，不要在同一个环境里依次执行全部方案。

### 二、pip：最需要掌握的基础工具

#### 1.创建环境并安装依赖

先安装 [Python](https://www.python.org/downloads/)。Windows 安装了 Python 启动器后，可用 `py -3.12` 选择解释器；也可以使用目标 Python 的完整路径。

1. 创建独立目录和虚拟环境。

```powershell
mkdir pip-demo
cd pip-demo
py -3.12 -m venv .venv
```

2. 直接使用环境内的 Python 安装和检查包，无需激活环境。

```powershell
.\.venv\Scripts\python.exe -m pip install --upgrade pip
.\.venv\Scripts\python.exe -m pip install "requests>=2.31,<3"
.\.venv\Scripts\python.exe -m pip show requests
.\.venv\Scripts\python.exe -m pip check
```

`python -m pip` 明确使用这个解释器对应的 pip，能减少电脑上多套 Python 导致的装错环境问题。`pip check` 检查已安装包的依赖是否兼容，不会检查业务代码是否正确。

Linux/macOS 创建环境通常使用 `python3 -m venv .venv`，环境内解释器路径改为 `./.venv/bin/python`。

#### 2.导出、恢复、更新和卸载

1. 在专用项目环境中导出已安装包清单。

```powershell
.\.venv\Scripts\python.exe -m pip freeze | Out-File -Encoding utf8 requirements.txt
```

2. 在另一份已经创建的项目环境中安装清单中的包。

```powershell
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
```

3. 需要变更时，单独执行更新或卸载，再按需重新导出清单。

```powershell
.\.venv\Scripts\python.exe -m pip install --upgrade requests
.\.venv\Scripts\python.exe -m pip uninstall requests
```

`pip freeze` 导出的是已安装包快照，不区分直接依赖和间接依赖，也不会计算完整锁定结果。`pip install -r` 通常不会删除环境中清单以外的包。恢复环境时，优先新建虚拟环境再安装。

pip 也提供实验性的 [`pip lock`](https://pip.pypa.io/en/stable/cli/pip_lock/)，其生成结果只保证适用于当前 Python 版本和平台；不要把 `freeze` 与该功能混为一谈。

#### 3.优缺点与适用场景

- **优点**：生态普及、安装来源丰富，适合直接配合 `venv`，大量教程和部署流程都能使用。
- **不足**：创建环境、声明依赖、更新清单需要自己组织；仅靠 `freeze` 难以清楚区分“想要的依赖”和“当前恰好装着的包”。
- **适用**：入门学习、一次性脚本、维护 `requirements.txt` 项目，以及部署流程已经围绕 pip 建立的团队。

### 三、uv：把常用开发流程集中管理

#### 1.安装并创建项目

uv 是 Astral 开发的工具，既提供兼容常见 pip 用法的接口，也提供完整的项目管理流程。它重视依赖解析、安装和缓存效率，但实际耗时仍取决于网络、缓存和是否需要编译。

1. Windows 可以通过 WinGet 安装，完成后重新打开终端。

```powershell
winget install --id=astral-sh.uv -e
uv --version
```

其他系统或安装方式见 [uv 安装文档](https://docs.astral.sh/uv/getting-started/installation/)。

2. 安装示例 Python 版本，并创建应用项目。

```powershell
uv python install 3.12
uv init --app --python 3.12 uv-demo
cd uv-demo
uv add requests
uv add --dev pytest
uv run python -c "import requests; print(requests.__version__)"
uv run pytest --version
```

`uv add` 会维护 `pyproject.toml`、`uv.lock` 和项目环境；开发依赖通常放入 `dev` 分组。`uv run` 会准备环境后运行命令，通常无需手动激活 `.venv`。

#### 2.同步、升级和移除依赖

1. 团队成员拿到项目后，按已有声明和锁文件准备环境。

```powershell
uv sync --locked
```

`--locked` 要求锁文件存在且与项目声明一致，否则报错，适合用于持续集成。普通 `uv sync` 则允许按需更新锁文件。同步默认会移除不属于所选依赖集合的额外包，应在 uv 管理的专用环境中执行。

2. 需要升级某个包时，更新锁定结果并同步。

```powershell
uv lock --upgrade-package requests
uv sync
```

升级受 `pyproject.toml` 中版本约束限制；如果锁定了精确版本，需要先调整声明。移除依赖使用 `uv remove requests`，会同步更新声明、锁文件和环境。

#### 3.已有pip项目也可以使用uv

如果暂时保留 `requirements.txt`，可以只使用 uv 的 pip 接口。在另一个已有此文件的项目目录中执行：

```powershell
uv venv --python 3.12
uv pip install -r requirements.txt
uv pip list
```

**`uv pip install requests` 只安装包，不会像 `uv add requests` 那样维护项目依赖声明和 `uv.lock`。** 需要迁移为 uv 项目时，先 `uv init`，再考虑 `uv add -r requirements.txt`；导入前应检查清单是否混有无关包和间接依赖。

#### 4.优缺点与适用场景

- **优点**：同时管理 Python、环境、依赖与锁文件；常用命令简洁，方便本地开发和自动化流程保持一致。
- **不足**：团队需要掌握项目接口与 pip 接口的区别；迁移复杂索引、特殊构建或旧安装参数时，需要核对兼容性。
- **适用**：新建 Web 服务、自动化项目、多人协作和频繁创建环境的持续集成任务。

### 四、pip-tools：保留pip，补上依赖解析和固定版本

#### 1.区分手写依赖与生成结果

pip-tools 提供 `pip-compile` 和 `pip-sync`：前者从依赖声明解析出固定版本清单，后者让环境按清单同步。它不负责下载 Python 或创建虚拟环境。

1. 在新项目中创建并激活环境，再安装工具。

```powershell
mkdir pip-tools-demo
cd pip-tools-demo
py -3.12 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install pip-tools
```

如果 PowerShell 策略阻止激活，可以直接使用 `.\.venv\Scripts\python.exe -m piptools compile` 或 `python.exe -m piptools sync` 的完整路径形式，无需修改系统策略。

2. 新建 `requirements.in`，只写主动使用的依赖。

```text
requests>=2.31,<3
```

3. 解析依赖、生成带哈希的固定版本清单，再同步环境。

```powershell
pip-compile --generate-hashes requirements.in
pip-sync requirements.txt
```

生成的 `requirements.txt` 包含间接依赖。日常编辑 `.in` 文件，不直接修改自动生成结果；也可以让 `pip-compile` 从 `pyproject.toml` 读取依赖。

4. 只升级一个包，检查生成文件差异后再同步。

```powershell
pip-compile --generate-hashes --upgrade-package requests requirements.in
pip-sync requirements.txt
```

`pip-sync` 会卸载清单以外的普通包，应在项目专用环境中执行。生成结果与 Python 版本、平台等环境条件有关，多平台项目应在目标环境验证，必要时分别生成清单。

#### 2.优缺点与适用场景

- **优点**：继续使用 requirements 文件，容易接入现有 pip 部署；直接依赖与解析结果分开，便于审查升级。
- **不足**：需要维护输入和输出文件，环境创建、打包发布仍由其他工具负责；不同目标环境可能需要不同结果。
- **适用**：已有 pip 项目希望改善可复现性，但暂时不迁移到完整项目管理工具的团队。

### 五、Poetry：兼顾依赖管理与包构建

#### 1.初始化、安装和运行

Poetry 围绕 `pyproject.toml` 管理项目，提供依赖分组、锁文件、虚拟环境和构建发布命令。建议通过 pipx 隔离安装，pipx 的安装方法见后文。

1. 在项目环境之外安装 Poetry，再创建示例包项目。

```powershell
pipx install poetry
poetry new poetry-demo
cd poetry-demo
poetry add requests
poetry add --group dev pytest
poetry run python -c "import requests; print(requests.__version__)"
poetry run pytest --version
```

Poetry 会选择兼容的 Python 并创建环境；本机有多个版本时，可使用 `poetry env use` 指向目标解释器。依赖声明写入 `pyproject.toml`，解析结果写入 `poetry.lock`。

2. 拿到已有项目后安装依赖；需要与锁文件同步时使用 Poetry 2.x 的 `sync`。

```powershell
poetry install
poetry sync
```

`install` 安装项目及其依赖，`sync` 还会移除不属于所选依赖集合的额外包。两条命令是不同需求下的选择，不必每次连续执行。

3. 按需执行升级、构建或移除。

```powershell
poetry update requests
poetry build
poetry remove requests
```

`poetry build` 在 `dist` 中生成分发包，不会上传到 PyPI；发布需要另行配置仓库和凭据。上面的 `poetry new` 会生成包骨架；若只是管理脚本依赖，可以在 `pyproject.toml` 的 `[tool.poetry]` 中设置 `package-mode = false`，不安装项目自身。

#### 2.优缺点与适用场景

- **优点**：依赖、分组、锁定和构建流程较完整，适合把可安装的 Python 包作为正式项目维护。
- **不足**：要理解项目元数据、包结构和环境选择；从旧版升级时，需要留意命令及插件变化。
- **适用**：Python 库开发、需要构建和发布分发包的项目，以及已经统一使用 Poetry 的团队。

### 六、Pipenv：围绕Pipfile管理应用依赖

#### 1.基本操作

Pipenv 将虚拟环境管理与依赖管理结合起来，使用 `Pipfile` 声明依赖，使用 `Pipfile.lock` 固定解析结果。本例要求本机已有可找到的 Python 3.12。

1. 隔离安装工具，再为新项目选择解释器和依赖。

```powershell
pipx install pipenv
mkdir pipenv-demo
cd pipenv-demo
pipenv --python 3.12
pipenv install requests
pipenv install --dev pytest
pipenv lock
```

2. 在已有锁文件的项目中安装开发依赖，并通过项目环境运行命令。

```powershell
pipenv sync --dev
pipenv run pytest --version
pipenv graph
```

`pipenv lock` 负责生成或刷新锁定结果；`pipenv sync --dev` 按已有锁文件安装并包含开发依赖，不重新解析锁文件。只需要运行依赖时使用 `pipenv sync`；不要据此认为它会像 `pip-sync` 一样自动清理所有额外包。

3. 按需升级或移除依赖。

```powershell
pipenv update requests
pipenv uninstall requests
```

#### 2.优缺点与适用场景

- **优点**：应用依赖与开发依赖分开，提供统一环境入口和依赖图，已有 Pipenv 项目容易按锁文件恢复。
- **不足**：依赖声明使用自己的 `Pipfile` 格式，切换到以 `pyproject.toml` 为中心的工具时需要迁移；复杂依赖仍可能增加锁定耗时。
- **适用**：既有 Pipenv 应用、团队已经维护 `Pipfile.lock` 的项目；新项目可同时评估 uv 或 Poetry。

### 七、Conda与Mamba：管理复杂的二进制依赖

#### 1.创建环境和安装包

Conda 从 channel（包渠道）安装包，可以同时管理 Python 解释器和许多非 Python 依赖。它与主要使用 PyPI 的工具属于不同包生态；相同名称的包，其版本和构建也可能不同。

1. 安装 [Miniconda](https://www.anaconda.com/docs/getting-started/miniconda/main) 或 [Miniforge](https://github.com/conda-forge/miniforge) 后，打开已初始化 Conda 的终端。
2. 在单一渠道中创建环境并安装科学计算包。

```powershell
conda create -n science-demo --override-channels -c conda-forge python=3.12 numpy pandas
conda activate science-demo
conda list
python -c "import numpy; print(numpy.__version__)"
```

需要新增包时使用 `conda install --override-channels -c conda-forge scipy`。只在 Conda 渠道缺少所需包时再考虑 pip，并先通过 Conda 安装 pip：

```powershell
conda install --override-channels -c conda-forge pip
python -m pip install httpx
```

先安装 Conda 依赖，再补充 pip 依赖；之后尽量避免两个管理器反复覆盖同一批核心包。大幅调整环境时，重新创建环境通常更清楚。

#### 2.导出环境与使用Mamba

1. 导出当前环境，在另一台机器上按文件创建。

```powershell
conda env export | Out-File -Encoding utf8 environment.yml
conda env create -n science-copy -f environment.yml
```

完整导出包含具体版本和构建信息，还可能带有本机 `prefix` 路径；分享前检查并删除不适用的绝对路径。跨系统可考虑 `conda env export --from-history`，但它只保留显式安装的 Conda 依赖，不是完整锁定，也不会自动收集后来通过 pip 安装的包。

2. 已安装 Mamba 时，可使用相似的命令创建环境，无需同时执行前面的 Conda 示例。

```powershell
mamba create -n mamba-demo --override-channels -c conda-forge python=3.12 numpy
mamba run -n mamba-demo python -c "import numpy; print(numpy.__version__)"
```

Mamba 使用 Conda 包生态，提供高效的解析和包操作实现，常用参数与 Conda 接近。现代 Conda 也采用 libmamba 求解器，不能笼统认为 Conda 总是很慢；差异应结合实际环境判断。

#### 3.优缺点与适用场景

- **优点**：能协调解释器与大量底层二进制库，科学计算和 GIS 等生态较完整。
- **不足**：环境通常更大，渠道选择、平台构建和 pip 混用需要额外管理；`environment.yml` 不天然等于跨平台锁文件。
- **适用**：依赖 GDAL、数值计算库等复杂组件，或者团队已有统一 Conda 环境规范的项目。安装 GPU 框架仍应遵循框架官方说明，不能认为建好 Conda 环境就自动具备驱动和 GPU 支持。

### 八、pipx：把命令行工具与项目依赖分开

#### 1.安装和使用

pipx 会为命令行应用创建独立环境，并将命令入口暴露到 PATH。例如，Poetry 本身可以由 pipx 管理，Poetry 再负责管理各个项目。

1. 在没有激活项目虚拟环境的终端中，安装 pipx 并配置命令路径。

```powershell
py -3.12 -m pip install --user pipx
py -3.12 -m pipx ensurepath
```

重新打开终端后，执行以下操作。Linux/macOS 推荐先查看 [pipx 官方安装方法](https://pipx.pypa.io/stable/how-to/install-pipx.html)，使用对应系统的包管理器安装。

2. 安装工具、查看列表、更新或卸载。

```powershell
pipx install black
black --version
pipx list
pipx upgrade black
pipx uninstall black
```

3. 临时运行工具时，也可以不长期安装。

```powershell
pipx run pycowsay hello
```

uv 也提供类似能力：`uv tool install black` 用于安装工具，`uvx black --version` 用于临时运行工具。

#### 2.优缺点与适用场景

- **优点**：不同命令行应用互相隔离，不必把 Poetry、格式化工具都装进全局 Python 或每个业务项目。
- **不足**：它管理的是命令行应用，不维护业务项目的依赖声明和锁文件。
- **适用**：个人电脑上的通用 CLI 工具。项目要求固定格式化工具版本时，应将其写入项目开发依赖，再通过 `uv run` 等项目入口运行。

`pipx install requests` 不能让项目直接 `import requests`；需要导入的库应交给项目包管理器安装。

### 九、实际项目如何选择和协作

| 具体情况                        | 建议                    | 主要原因                             |
| ------------------------------- | ----------------------- | ------------------------------------ |
| 学习 Python、理解包安装         | `venv + pip`            | 基础通用，容易看清环境与安装器的关系 |
| 新建普通应用或自动化项目        | uv                      | 统一 Python、依赖、环境和运行入口    |
| 老项目依赖 requirements 文件    | pip，按需加入 pip-tools | 减少迁移，逐步改善版本固定流程       |
| 开发并发布 Python 库            | Poetry 或 uv            | 依赖管理与构建流程能够衔接           |
| 仓库已有 `Pipfile.lock`         | Pipenv                  | 沿用团队已有工作流                   |
| 需要复杂科学计算或 GIS 二进制包 | Conda / Mamba           | 能管理许多 Python 之外的依赖         |
| 只想安装一个命令行应用          | pipx 或 `uv tool`       | 独立环境，便于全局调用               |

团队协作时，建议统一以下做法：

1. 阅读仓库的 README 和依赖文件，确认主要包管理器及 Python 版本。
2. 提交依赖声明和对应锁文件，不提交 `.venv`、包缓存和本机绝对路径。
3. 新增依赖通过该工具的项目命令完成；不要只安装到本地，却遗漏依赖声明。
4. 安装环境与升级依赖分开，持续集成优先依据已提交的锁定结果安装。
5. 升级后审查依赖文件差异，并运行项目测试；锁文件不能代替业务兼容性验证。

不同工具的锁文件不能直接互换。跨平台安装仍受 Python 版本、系统架构、可用二进制包和外部依赖影响；工具能够锁定版本，并不意味着它能提供操作系统或 GPU 驱动。

### 十、官方文档

- [pip 用户指南](https://pip.pypa.io/en/stable/user_guide/) 与 [pip freeze 说明](https://pip.pypa.io/en/stable/cli/pip_freeze/)
- [uv 项目管理](https://docs.astral.sh/uv/guides/projects/) 与 [锁定和同步](https://docs.astral.sh/uv/concepts/projects/sync/)
- [pip-tools 文档](https://pip-tools.readthedocs.io/en/stable/)
- [Poetry 基础用法](https://python-poetry.org/docs/basic-usage/) 与 [命令说明](https://python-poetry.org/docs/cli/)
- [Pipenv 快速入门](https://pipenv.pypa.io/en/latest/quick_start.html)
- [Conda 环境管理](https://docs.conda.io/projects/conda/en/stable/user-guide/tasks/manage-environments.html) 与 [Mamba 用法](https://mamba.readthedocs.io/en/latest/user_guide/mamba.html)
- [pipx 官方文档](https://pipx.pypa.io/) 与 [uv 工具管理](https://docs.astral.sh/uv/guides/tools/)
