---
title: PyTorch深度学习入门之线性回归实践
typora-root-url: PyTorch深度学习入门之线性回归实践
date: 2026-10-13 15:20:52
mathjax: true
categories:
    - 机器学习
tags:
    - Python
    - PyTorch
    - 深度学习
---

### 一、从一条直线开始理解模型训练

第一次接触深度学习时，张量、损失函数、反向传播等术语很容易让人觉得无从下手。其实可以先从一个很小的任务开始：给计算机一些散点，让它学会用一条直线描述这些数据的变化趋势。

本文使用 PyTorch 完成一个模拟线性回归案例。只要具备 Python 变量、函数和循环的基础，就可以按照步骤安装依赖、运行代码，并观察模型怎样逐渐学会这条直线。

本案例只有一个线性层，没有隐藏层，严格来说属于线性回归，并不是深层神经网络。它适合作为深度学习的第一项练习，因为准备数据、定义模型、计算损失、反向传播和更新参数这些步骤，在后续训练神经网络时仍然会用到。

完成后，你将得到：

- 一个能够从模拟数据中学习斜率和截距的模型。
- 一条展示训练过程的损失曲线。
- 一张同时展示样本散点、拟合直线和真实直线的图。
- 一段能够预测新输入对应数值的代码。

### 二、先认识几个基本概念

#### 1.样本、特征与标签

假设我们想根据房屋面积估算价格，那么一套房屋的数据就是一个样本，面积是输入特征，已经知道的价格是标签，也就是希望模型学习预测的目标值。

本案例不使用真实房价，而是生成 160 组模拟数据。每组数据只有一个输入 `x` 和一个目标值 `y`，相当于一张有 160 行、两列的表。

| 概念   | 本案例中的含义                 |
| ------ | ------------------------------ |
| 样本   | 一组配对的 `x` 和 `y`          |
| 特征   | 输入数值 `x`                   |
| 标签   | 与输入对应的目标数值 `y`       |
| 数据集 | 全部 160 组样本                |
| 预测值 | 模型根据 `x` 算出来的 `y_pred` |

因为训练时已经知道目标值，所以这是一个**监督学习**任务。因为预测的是连续数值，所以它属于**回归**；预测“猫或狗”这样的类别，则属于分类任务。

#### 2.线性回归到底在学什么

中学阶段学过的直线方程，可以写成：

$$
\hat{y} = w x + b
$$

其中带帽子的 y 表示预测值，对应代码中的 `y_pred`；`w` 是权重，在一元线性回归中对应斜率；`b` 是偏置，对应截距。训练模型，就是不断调整这两个数，让预测值尽量接近标签。

例如，当权重为 3、偏置为 10、输入为 2 时，预测值的计算过程如下：

$$
\hat{y} = 3 \times 2 + 10 = 16
$$

这里的数字只是帮助理解公式，后面的真实系数由数据生成函数决定。

模拟数据还会加入噪声：

$$
y = a x + 10.15 + \varepsilon
$$

其中 a 表示生成数据时使用的真实斜率，希腊字母 epsilon 表示随机噪声。噪声可以理解为无法用这条直线解释的随机变化。因此，样本会分布在直线附近，而不是全部落在直线上。

#### 3.张量是什么

张量，也就是 `Tensor`，可以先理解为 PyTorch 使用的多维数值数组。

- 一个数可以表示为零维张量，也叫标量。
- 一排数可以表示为一维张量。
- 一张由行和列组成的表可以表示为二维张量。

本案例将输入与标签都组织成 `[160, 1]` 的二维张量：第一维表示 160 个样本，第二维表示每个样本只有一个数值。张量还可以参与自动求导，这是 PyTorch 帮助模型训练的基础。

#### 4.损失函数与优化器

损失函数用于衡量预测有多不准确。本文采用均方误差，英文缩写为 MSE：先计算每个预测值与标签的差，把差平方，最后求平均。

$$
\mathrm{MSE} = \frac{1}{n} \sum_{i=1}^{n} (\hat{y}_{i} - y_{i})^{2}
$$

其中 n 表示参与计算的数值个数，i 表示第几个数值；带帽子的 y 是预测值，不带帽子的 y 是标签。

例如两个预测值是 `[2, 5]`，标签是 `[3, 3]`，那么 MSE 的计算过程如下：

$$
\mathrm{MSE} = \frac{(2 - 3)^{2} + (5 - 3)^{2}}{2} = \frac{1 + 4}{2} = 2.5
$$

平方让正负误差不会互相抵消，也会让较大的偏差受到更重的惩罚。

优化器负责根据梯度调整参数。梯度描述参数变化对损失的影响；梯度下降沿着梯度的反方向迈出一小步，尝试降低损失。

学习率决定这一步迈多大。本文使用 `0.01`，学习率过小可能训练缓慢，过大则可能让损失震荡甚至发散。

#### 5.Batch与Epoch

一次拿出部分样本训练，这部分样本叫一个批次，也就是 `Batch`。完整遍历一遍训练集，叫一轮，也就是 `Epoch`。

本文有 160 个样本，每批 16 个，因此每轮的批次数为：

$$
\frac{160}{16} = 10
$$

每个批次更新一次参数，训练 500 轮时，参数更新总次数为：

$$
500 \times 10 = 5000
$$

这里的 500 轮是方便观察收敛过程的实验设置，不是所有任务都应该采用的固定值。

### 三、准备运行环境

#### 1.创建独立的Python环境

以下以 Windows 和 Miniconda 为例，使用 Python 3.11 和 CPU 运行。数据量很小，不需要独立显卡，也不需要配置 CUDA。

尚未安装 Miniconda 时，可以先参考本站的《Miniconda安装和简单使用教程》。安装后打开开始菜单中的 Miniconda Prompt 或 Anaconda Prompt，依次执行：

```powershell
conda create -n pytorch-linear-demo python=3.11 -y
conda activate pytorch-linear-demo
```

创建一个存放代码的目录，并进入该目录：

```powershell
mkdir pytorch-linear-demo
cd pytorch-linear-demo
```

环境名称与文件夹名称可以相同，但它们是两回事：前者用于隔离 Python 依赖，后者用于保存自己的代码和图片。

#### 2.安装所需依赖

在已经激活的环境中执行：

```powershell
python -m pip install --upgrade pip
python -m pip install torch --index-url https://download.pytorch.org/whl/cpu
python -m pip install scikit-learn matplotlib
```

这里只安装需要的 `torch`，不需要额外安装 `torchvision` 和 `torchaudio`。其他系统或需要 GPU 时，可以通过 [PyTorch 官方安装页面](https://pytorch.org/get-started/locally/) 选择对应命令。

如果当前 Conda 环境已经安装了可用的 CUDA 版 PyTorch，可以直接使用该环境，跳过创建环境和安装 `torch` 的步骤，只补齐缺少的其他依赖。CUDA 版也能执行 CPU 运算，不需要为了本案例重新安装 CPU 版。

各个库的分工如下：

| 库           | 用途                                   |
| ------------ | -------------------------------------- |
| PyTorch      | 张量计算、模型定义、自动求导和参数更新 |
| scikit-learn | 使用 `make_regression` 生成模拟数据    |
| Matplotlib   | 绘制损失曲线和拟合结果                 |

注意：安装时使用的包名是 `scikit-learn`，代码中导入时使用的是 `sklearn`。

#### 3.检查解释器和依赖

```powershell
python -c "import sys, torch, sklearn, matplotlib; print(sys.executable); print(torch.__version__); print(sklearn.__version__); print(matplotlib.__version__)"
```

能够打印解释器路径和三个版本号，说明依赖可以导入。如果使用 VS Code 或 PyCharm，还要将项目解释器切换到刚创建的 `pytorch-linear-demo` 环境。

#### 4.CUDA版PyTorch会自动使用GPU吗

**不会。安装了 CUDA 版 PyTorch，表示这套安装具备 CUDA 支持；代码实际在哪个设备上计算，还取决于模型参数和张量放在哪个设备。** Conda 负责管理环境，不会自动把模型搬到显卡上。

在本文完整 demo 的默认设置下，`torch.from_numpy()` 得到的张量位于 CPU，`nn.Linear(1, 1)` 创建的模型参数也位于 CPU。代码没有将它们移动到 GPU，因此训练和预测都在 CPU 上完成。

可以在当前环境中运行下面的命令，检查 PyTorch 的 CUDA 支持和设备可用性：

```powershell
python -c "import torch; print('Build CUDA:', torch.version.cuda); print('CUDA available:', torch.cuda.is_available())"
```

`torch.version.cuda` 显示这套 PyTorch 构建使用的 CUDA 版本，CPU 版通常返回 `None`；`torch.cuda.is_available()` 检查当前进程是否能够使用 CUDA。即使后者为 `True`，也只说明可以使用 GPU，不表示当前模型已经在 GPU 上运行。

在完整 demo 中，创建 `model` 后可以临时添加以下代码，直接查看实际设备：

```python
print("Model device:", next(model.parameters()).device)
print("Data device:", x.device, y.device)
```

默认应看到 `cpu`。第六节给出了把训练部分切换到 GPU 的具体修改方法。

### 四、先运行完整Demo

在刚才创建的代码目录中，新建 `linear_regression_demo.py`，将下面的完整代码复制进去。后续章节的短代码用于解释，不需要再次追加到文件末尾。

这份代码保留了原始 demo 的数据生成参数、模型、批量大小、学习率和训练轮数，同时修正了每轮损失的统计方式，增加了随机种子、预测示例和结果绘图。

```python
import torch
from torch import nn, optim
from torch.utils.data import DataLoader, TensorDataset
from sklearn.datasets import make_regression
import matplotlib.pyplot as plt


def create_dataset():
    # 生成 160 个样本，每个样本只有一个输入特征
    x, y, coef = make_regression(
        n_samples=160,
        n_features=1,
        noise=20.0,
        coef=True,
        bias=10.15,
        random_state=42,
    )

    x = torch.from_numpy(x).float()
    y = torch.from_numpy(y).float().view(-1, 1)
    return x, y, float(coef.item())


def train():
    # 固定模型初始化和数据打乱使用的随机种子
    torch.manual_seed(42)
    x, y, coef = create_dataset()
    dataset = TensorDataset(x, y)
    dataloader = DataLoader(dataset, batch_size=16, shuffle=True)

    model = nn.Linear(1, 1)
    loss_func = nn.MSELoss()
    optimizer = optim.SGD(model.parameters(), lr=0.01)
    train_epochs = 500
    loss_list = []

    model.train()
    for epoch in range(train_epochs):
        # 每一轮重新统计，避免混入前面轮次的损失
        total_loss = 0.0
        total_samples = 0

        for train_x, train_y in dataloader:
            y_pred = model(train_x)
            loss_val = loss_func(y_pred, train_y)

            optimizer.zero_grad()
            loss_val.backward()
            optimizer.step()

            batch_size = train_x.size(0)
            total_loss += loss_val.item() * batch_size
            total_samples += batch_size

        loss_avg = total_loss / total_samples
        loss_list.append(loss_avg)
        if epoch == 0 or (epoch + 1) % 50 == 0:
            print(f"Epoch {epoch + 1}/{train_epochs}, Loss: {loss_avg:.4f}")

    print(f"Learned Coefficient: {model.weight.item():.4f}, True Coefficient: {coef:.4f}")
    print(f"Learned Bias: {model.bias.item():.4f}, True Bias: 10.15")

    # 训练结束后，用固定下来的模型进行评估与预测
    model.eval()
    with torch.no_grad():
        final_mse = loss_func(model(x), y).item()
        new_x = torch.tensor([[0.0], [1.0], [2.0]], dtype=torch.float32)
        new_y = model(new_x)
        # 按从小到大的顺序取点，让拟合曲线易于阅读
        x_line = torch.linspace(x.min().item(), x.max().item(), 100).view(-1, 1)
        y_line = model(x_line)
        y_true_line = coef * x_line + 10.15

    print(f"Final training MSE: {final_mse:.4f}")
    for input_value, predicted_value in zip(new_x.flatten(), new_y.flatten()):
        print(f"x = {input_value.item():.1f}, prediction = {predicted_value.item():.4f}")

    fig, axes = plt.subplots(1, 2, figsize=(12, 4))
    axes[0].plot(range(1, train_epochs + 1), loss_list)
    axes[0].set_title("Training Loss")
    axes[0].set_xlabel("Epoch")
    axes[0].set_ylabel("MSE")
    axes[0].grid(alpha=0.3)

    axes[1].scatter(x.numpy().ravel(), y.numpy().ravel(), s=18, alpha=0.6, label="Data")
    axes[1].plot(x_line.numpy().ravel(), y_line.numpy().ravel(), color="red", label="Fitted line")
    axes[1].plot(x_line.numpy().ravel(), y_true_line.numpy().ravel(), "--", color="green", label="True line")
    axes[1].set_title("Linear Regression Fit")
    axes[1].set_xlabel("X")
    axes[1].set_ylabel("Y")
    axes[1].legend()

    fig.tight_layout()
    fig.savefig("linear_regression_result.png", dpi=150)
    plt.show()


if __name__ == "__main__":
    train()
```

保存后，在文件所在目录运行：

```powershell
python linear_regression_demo.py
```

程序会打印训练损失、学习到的参数和三个新输入的预测值，并弹出包含两张子图的窗口。关闭绘图窗口后，程序结束；同一张图也会保存为当前工作目录中的 `linear_regression_result.png`，再次运行会覆盖这个文件。

### 五、分段理解数据准备

#### 1.导入模块

`torch` 提供基础张量操作，`nn` 提供构建模型和计算损失的组件，`optim` 提供优化器。`TensorDataset` 和 `DataLoader` 负责组织、分批读取数据。

这里使用 `make_regression`，是为了省去下载数据、清洗表格等步骤，把注意力集中在模型训练上。Matplotlib 只负责画图，不参与参数学习。

#### 2.生成带噪声的数据

```python
x, y, coef = make_regression(
    n_samples=160, n_features=1, noise=20.0,
    coef=True, bias=10.15, random_state=42,
)
```

| 参数              | 含义                                         |
| ----------------- | -------------------------------------------- |
| `n_samples=160`   | 生成 160 个样本                              |
| `n_features=1`    | 每个样本有一个输入特征                       |
| `noise=20.0`      | 添加标准差为 20 的高斯噪声，不是“20% 的噪声” |
| `coef=True`       | 同时返回生成数据时使用的真实系数             |
| `bias=10.15`      | 生成数据时使用的真实截距                     |
| `random_state=42` | 固定数据生成的随机状态，便于重复实验         |

返回值 `coef` 用于与训练结果比较，并不会传给优化器。模型只能根据 `x` 和 `y` 学习，不会提前读取标准答案中的斜率。

`random_state=42` 控制 scikit-learn 生成的数据，`torch.manual_seed(42)` 控制 PyTorch 的随机过程。两者各管一部分；固定种子便于在相同环境中复现，不代表不同平台和库版本之间的所有小数位都完全一致。

#### 3.转换为浮点张量并对齐形状

```python
x = torch.from_numpy(x).float()
y = torch.from_numpy(y).float().view(-1, 1)
```

`make_regression` 返回 NumPy 数组，而 PyTorch 模型需要张量，因此使用 `torch.from_numpy()` 转换。`.float()` 将数据转换成 `float32`，与本例模型默认使用的参数类型一致。

原始 `x` 的形状是 `[160, 1]`，原始 `y` 的形状是 `[160]`。`view(-1, 1)` 将 `y` 改成一列，`-1` 表示根据元素总数自动推算行数。

这个转换很关键：对于一个批次，模型输出为 `[16, 1]`，标签也应该是 `[16, 1]`。如果把 `[16]` 的标签直接与输出计算 MSE，广播机制可能将计算扩展成 `[16, 16]`，不再是一一对应地比较样本。

可以在 `create_dataset()` 调用后临时加入 `print(x.shape, y.shape)`，预期两者都是 `torch.Size([160, 1])`。

#### 4.创建数据集与数据加载器

```python
dataset = TensorDataset(x, y)
dataloader = DataLoader(dataset, batch_size=16, shuffle=True)
```

`TensorDataset` 把相同位置的输入和标签配成一对。`DataLoader` 每次取出 16 对样本，交给训练循环。

`shuffle=True` 会在遍历数据时打乱样本顺序，但不会打乱输入与标签的对应关系。这样每轮的批次组合可以变化，而不是一直按照同一个顺序训练。

### 六、分段理解模型与训练过程

#### 1.用一个线性层表示直线

```python
model = nn.Linear(1, 1)
```

第一个 `1` 表示每个样本有一个输入特征，第二个 `1` 表示每个样本输出一个数值。它们不表示批量大小，也不表示训练轮数。

`nn.Linear` 默认带有偏置，因此这里恰好包含两个可训练的数：`model.weight` 中的斜率，以及 `model.bias` 中的截距。

刚创建时，模型参数经过随机初始化，尚未学到数据规律。执行 `model(train_x)`，就是让当前这条直线对一批输入计算预测值，这一步叫**前向传播**。

#### 2.设置损失函数与优化器

```python
loss_func = nn.MSELoss()
optimizer = optim.SGD(model.parameters(), lr=0.01)
```

`nn.MSELoss()` 默认对所有输入元素的平方误差求平均。由于本案例每个样本只有一个输出，这就是当前批次的样本平均损失。

`model.parameters()` 将模型中需要学习的参数交给优化器。`SGD` 是随机梯度下降优化器，这里每次根据一个小批次计算出的梯度更新权重和偏置。

可以把它理解为：损失函数负责给出误差，自动求导负责计算调整方向，优化器负责执行调整。

#### 3.训练循环里的五个关键动作

```python
y_pred = model(train_x)
loss_val = loss_func(y_pred, train_y)
optimizer.zero_grad()
loss_val.backward()
optimizer.step()
```

按执行顺序理解：

1. `model(train_x)`：使用当前参数计算预测值。
2. `loss_func(...)`：将预测值与标签比较，得到一个损失标量。
3. `optimizer.zero_grad()`：清除上一批次留下的参数梯度。
4. `loss_val.backward()`：反向传播，自动计算损失对各参数的梯度。
5. `optimizer.step()`：根据梯度和学习率更新参数。

PyTorch 默认会累加梯度，所以本案例在每次反向传播前清零。也可以把 `zero_grad()` 放在前向传播之前，关键是不要在本次 `backward()` 与 `step()` 之间清除刚计算的梯度。

原始 demo 使用 `loss_val.sum().backward()`。由于默认的 `MSELoss` 已经返回一个标量，再调用 `.sum()` 不会改变结果，直接写 `loss_val.backward()` 更清楚。

需要区分两个动作：`backward()` 计算梯度，`step()` 才真正修改参数。只计算梯度而不更新参数，模型不会继续学习。

#### 4.正确统计每一轮的平均损失

原始 demo 在所有训练轮次开始之前定义 `total_loss` 和 `total_samples`，之后一直累加。因此第二轮之后打印的是从训练开始累计到当前的平均损失，早期的大误差会持续影响结果。

这种写法不会直接改变参数更新，但会让损失曲线难以反映当前一轮的训练状态。另外，原代码的 `total_samples += 1` 实际统计的是批次数，并不是样本数。

完整代码将累计量放到每轮开头清零，并按样本数加权统计：

```python
total_loss += loss_val.item() * batch_size
total_samples += batch_size
loss_avg = total_loss / total_samples
```

这里前两行在每个批次结束后执行，最后一行在本轮所有批次结束后执行。`.item()` 把只有一个元素的张量转换成 Python 数字，方便统计和打印。

例如两个批次分别有 16 个和 4 个样本，平均损失分别是 10 和 20，那么整轮平均值应该按各批次的样本数加权：

$$
\frac{10 \times 16 + 20 \times 4}{16 + 4} = 12
$$

直接对两个批次的损失求平均，会得到不同的结果：

$$
\frac{10 + 20}{2} = 15
$$

后一种算法让只有 4 个样本的批次占了相同权重，不能代表这 20 个样本的平均损失。

本例中 160 可以被 16 整除，每批大小相同，两种平均方式在单轮内等价；按样本数加权的写法还能正确处理最后一批不足 16 个样本的情况。

`loss_list` 记录的是各批次在训练过程中、更新参数前计算的损失汇总。由于一轮中参数一直在变，它与训练结束后使用最终参数一次性计算的 MSE 不必完全相等。

#### 5.训练模式与预测模式

```python
model.eval()
with torch.no_grad():
    final_mse = loss_func(model(x), y).item()
    new_x = torch.tensor([[0.0], [1.0], [2.0]], dtype=torch.float32)
    new_y = model(new_x)
```

`model.train()` 和 `model.eval()` 分别切换训练模式与评估模式，主要影响 Dropout、BatchNorm 等层。本案例只有线性层，两种模式的计算结果没有区别，但保留这个习惯有助于后续学习。

`torch.no_grad()` 则关闭该代码块中的梯度记录。预测时不需要反向传播，这样可以减少不必要的计算记录，也便于把输出直接转换成 NumPy 数组进行绘图。

**`eval()` 不会自动关闭梯度记录，`no_grad()` 也不会自动切换评估模式。** 它们解决的是两个不同问题。

`new_x` 使用双层方括号，得到 `[3, 1]` 的形状，表示三个样本、每个样本一个特征。若只预测输入为 2 的情况，可以使用 `torch.tensor([[2.0]])`。

#### 6.怎样把训练部分切换到GPU

如果希望体验 GPU 训练，可以对第四节的完整代码做以下三处修改。保留数据集在 CPU，每批数据取出后再移动到训练设备；训练结束后将模型移回 CPU，继续使用原有的评估和绘图代码。

1. 在 `train()` 中，将创建模型的那一行替换为以下代码，位置仍在创建优化器之前：

```python
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model = nn.Linear(1, 1).to(device)
print("Training device:", next(model.parameters()).device)
```

2. 在每批数据的循环开头、调用 `model(train_x)` 之前，添加两行设备转换。循环开头变为：

```python
for train_x, train_y in dataloader:
    train_x = train_x.to(device)
    train_y = train_y.to(device)
    y_pred = model(train_x)
```

后续计算损失、反向传播、更新参数和累计损失的代码保持原来的位置。模型、输入与标签必须位于相同设备，只移动模型而不移动数据通常会产生设备不一致的错误。

3. 在整个训练循环结束后、打印 `Learned Coefficient` 之前，添加下面这一行，缩进与 `model.train()` 相同：

```python
model = model.cpu()
```

此时不再调用优化器，后续对完整数据集的评估、新输入的预测和绘图均在 CPU 上执行。如果不把模型移回 CPU，就必须把这些阶段的输入也移到 GPU，并在调用 `.numpy()` 前把结果移回 CPU。

当 CUDA 可用时，打印的训练设备通常是 `cuda:0`，表示第一张 CUDA 显卡；否则这段写法会回退到 CPU。想核对某个训练批次，可以在设备转换后检查 `train_x.device` 和 `train_y.device`，它们应与模型一致。

本案例只有两个可训练参数，每批只有 16 个样本。GPU 的启动、数据传输及每批 `.item()` 取值带来的同步开销，可能超过计算本身的收益，因此使用 GPU 不一定更快。

### 七、观察训练结果和图像

#### 1.怎样判断模型确实学到了东西

完整代码打印第一轮以及每隔 50 轮的损失，避免 500 行日志淹没重点。观察时主要看以下几点：

1. 前期损失是否明显下降，随后是否在一定范围内稳定。
2. `Learned Coefficient` 是否与 `True Coefficient` 接近。
3. `Learned Bias` 是否与真实截距 `10.15` 接近。
4. 拟合直线是否经过散点的主要分布区域。

在 Python 3.11.14、PyTorch 2.9.1+cpu、scikit-learn 1.9.1 和 Matplotlib 3.10.8 环境中，运行上述完整代码得到的部分输出如下：

```text
Epoch 1/500, Loss: 4235.6482
Epoch 50/500, Loss: 386.1332
Epoch 500/500, Loss: 386.7590
Learned Coefficient: 71.9236, True Coefficient: 71.2179
Learned Bias: 13.2887, True Bias: 10.15
Final training MSE: 385.6770
x = 0.0, prediction = 13.2887
x = 1.0, prediction = 85.2123
x = 2.0, prediction = 157.1359
```

可以看到，学习到的关系约为：

$$
\hat{y} \approx 71.9236 x + 13.2887
$$

当输入为 0 时，预测值就是模型的偏置。

损失是误差指标，不是准确率。例如 MSE 等于 400，不能解释成“准确率为 400”或“错误率为 400%”。对 MSE 开平方可以得到均方根误差，也就是 RMSE，它与目标值具有相同单位：

$$
\mathrm{RMSE} = \sqrt{\mathrm{MSE}} = \sqrt{400} = 20
$$

数据加入了标准差为 20 的噪声，因此噪声方差为：

$$
\sigma^{2} = 20^{2} = 400
$$

最终 MSE 通常会处在几百这一量级。这只是理解结果的尺度，不是必须精确达到的目标，也不是有限样本训练误差的严格下界。

#### 2.为什么参数和真实值不完全相同

模型拟合的是这 160 个带噪声的观测样本。有限样本中的噪声会影响最合适的斜率和截距，因此即使训练正常，学习结果也不必与生成数据时的真实参数完全一致。

此外，小批次之间存在差异，使用固定学习率训练时，损失和参数可能在稳定区域小幅波动。不能只凭某一轮损失略有上升，就判断训练失败。

#### 3.损失曲线与拟合图分别看什么

下面是同一次运行保存的结果图：

![线性回归训练的损失曲线与拟合结果](../PyTorch深度学习入门之线性回归实践/linear_regression_result.png)

左图横轴是训练轮次，纵轴是该轮训练中的平均 MSE。它适合观察模型是否收敛，也就是训练是否逐渐趋于稳定。

右图蓝色散点是训练样本，红线是模型学到的关系，绿色虚线是不含噪声的真实关系。噪声越大，散点围绕真实直线的分布通常越宽。

绘图时用 `torch.linspace()` 生成从小到大排列的 100 个输入，再计算预测值。这样连线方向清晰，也便于以后替换为曲线模型。

`x` 和 `y` 本身不需要梯度，`y_line` 又是在 `no_grad()` 中生成的，因此这里可以直接调用 `.numpy()`。原始 demo 的 `model(x).detach().numpy()` 则是先将输出从计算图中分离，再转为数组。

本案例的所有数据都在 CPU 上；如果以后改用 GPU，通常需要先调用 `.cpu()`，再转换成 NumPy 数组。

#### 4.训练集表现不等于实际预测能力

本案例将全部样本用于训练，`Final training MSE` 也在相同数据上计算，用于帮助理解训练流程。它不是独立测试集的成绩。

真实项目还需要划分训练集与验证集或测试集：训练集用于学习参数，验证集用于比较设置，测试集用于评估最终模型对未参与训练的数据的表现。

代码对 `0`、`1`、`2` 的预测演示了模型如何使用，但这些输入没有独立的观测标签，因此不能仅凭这几次输出评价泛化能力。

### 八、常见问题与动手练习

#### 1.提示找不到torch或sklearn

先确认终端已经执行 `conda activate pytorch-linear-demo`，再使用前面的依赖检查命令查看解释器路径。

如果终端能运行、编辑器不能运行，通常是编辑器选择了另一套解释器。使用 `python -m pip` 安装依赖，可以减少 `pip` 与当前 Python 不对应的问题。

不要将脚本命名为 `torch.py`、`sklearn.py` 或 `matplotlib.py`，否则可能遮挡同名第三方库。

#### 2.损失变成nan或者始终很大

确认学习率为 `0.01`，没有误写成 `1` 或更大的值；检查输入与标签是否都是浮点张量，形状是否一致。

如果自己修改了训练循环，还要检查是否保留了 `zero_grad()`、`backward()` 和 `step()`。换成真实数据后，也需要检查异常值和特征的数值范围。

#### 3.没有弹出图形窗口

在没有桌面界面的服务器或使用非交互式绘图后端时，`plt.show()` 可能无法弹窗。程序在弹窗之前已经保存 PNG，可以直接查看工作目录中的 `linear_regression_result.png`。

图中使用英文标题和图例，以减少不同机器缺少中文字体时出现方框的问题。文件存在但不在预期位置时，检查运行程序的当前工作目录。

#### 4.一次只改一个条件

先完整跑通默认代码，再尝试下面的实验，每次只改一个条件，并记录结果：

| 改动                        | 可以观察什么                             |
| --------------------------- | ---------------------------------------- |
| 将 `noise` 改为 `0.0`       | 散点接近真实直线，训练充分时损失可接近零 |
| 将 `noise` 改为 `50.0`      | 散点更分散，通常会留下更大的拟合误差     |
| 将学习率改为 `0.001`        | 相同更新次数下，前期下降通常更慢         |
| 将 `batch_size` 改为 `160`  | 每轮只更新一次，500 轮一共更新 500 次    |
| 将 `train_epochs` 改为 `20` | 观察有限轮次下参数距离稳定结果还有多远   |

改变批量大小时，除了每批包含的样本数，固定轮数下的参数更新次数也会变化。比较曲线时要一起考虑这两个因素。

暂时不要只把 `n_features` 改成 `2`：多特征任务还需要同步修改 `nn.Linear` 的输入维度、系数处理、预测输入和绘图方式。先掌握一元回归，再逐步扩展会更容易定位问题。

### 九、官方参考资料

- [PyTorch 安装指南](https://pytorch.org/get-started/locally/)
- [PyTorch 基础教程：优化模型参数](https://docs.pytorch.org/tutorials/beginner/basics/optimization_tutorial.html)
- [nn.Linear 文档](https://docs.pytorch.org/docs/stable/generated/torch.nn.Linear.html)
- [nn.MSELoss 文档](https://docs.pytorch.org/docs/stable/generated/torch.nn.MSELoss.html)
- [PyTorch CUDA 设备与张量操作说明](https://docs.pytorch.org/docs/stable/notes/cuda.html)
- [scikit-learn：make_regression 文档](https://scikit-learn.org/stable/modules/generated/sklearn.datasets.make_regression.html)
