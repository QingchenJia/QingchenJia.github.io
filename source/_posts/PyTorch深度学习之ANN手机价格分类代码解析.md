---
title: PyTorch深度学习之ANN手机价格分类代码解析
typora-root-url: PyTorch深度学习之ANN手机价格分类代码解析
date: 2026-10-21 19:32:23
categories:
    - 机器学习
tags:
    - Python
    - PyTorch
    - 深度学习
---

这份 demo 使用 PyTorch 构建人工神经网络（Artificial Neural Network，简称 ANN），根据一部手机的 20 个特征，预测它所属的四种价格类别之一。它完成的是**多分类任务**，输出价格类别的编号，而不是具体售价。

重新阅读时，可以先抓住一条主线：把 CSV 中的数据转换成模型能够接收的张量，确定网络结构，通过训练集调整权重，最后用测试集检查分类是否正确。

下面按“创建数据集 → 配置模型参数 → 模型训练 → 模型评估”的顺序，分段展示并解释原代码。代码中的语句、参数和注释均保持原样；各代码块是同一份脚本的组成部分，正文只调整展示顺序，便于回顾当时的实现思路。

### 一、创建数据集

#### 1.先看依赖、设备和路径

原代码开头如下：

```python
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
import torch
import torch.nn as nn
import torch.optim as optim
import pandas as pd
import numpy as np
import time
import os

device = torch.device("cuda:0" if torch.cuda.is_available() else "cpu")
path_prefix = "Auto-Phone-Classification/"
```

这些导入可以按职责理解：

| 模块或组件             | 在这份代码中的作用                     |
| ---------------------- | -------------------------------------- |
| `pandas`               | 读取 CSV，用列位置分离特征和标签       |
| `numpy`                | 指定特征和标签的数值类型               |
| `train_test_split`     | 将样本划分为训练集和测试集             |
| `StandardScaler`       | 根据训练集统计量，对特征进行标准化     |
| `torch`、`nn`、`optim` | 张量计算、搭建网络、计算损失和更新参数 |
| `time`、`os`           | 统计训练耗时、创建模型保存目录         |

`device` 在 CUDA 可用时选择第一张 CUDA 显卡 `cuda:0`，否则选择 CPU。原注释中的“移动到 GPU”，实际执行的是移动到 `device`，因此在没有可用 CUDA 的环境中仍然是 CPU。

`path_prefix` 同时用于定位数据文件和模型文件。它是相对于**程序当前工作目录**的路径，不会自动以 Python 脚本所在目录为起点。例如，数据读取位置是 `Auto-Phone-Classification/data/train.csv`，训练后的权重保存在 `Auto-Phone-Classification/model/phone_classification_model.pth`。

#### 2.创建数据集的完整函数

```python
# 创建数据集
def create_dataset(path):
    # 读取CSV文件
    csv_data = pd.read_csv(path)
    # 将数据分为特征和标签
    x, y = csv_data.iloc[:, :-1].values, csv_data.iloc[:, -1].values
    # 将特征和标签转换为浮点数和整数
    x = x.astype(np.float32)
    y = y.astype(np.int64)

    x_train, x_test, y_train, y_test = train_test_split(
        x, y, test_size=0.2, stratify=y, shuffle=True
    )

    # 对特征进行标准化处理
    scaler = StandardScaler()
    x_train = scaler.fit_transform(x_train)
    x_test = scaler.transform(x_test)

    # 将数据转换为张量
    x_train_tensor = torch.tensor(x_train)
    x_test_tensor = torch.tensor(x_test)
    y_train_tensor = torch.tensor(y_train)
    y_test_tensor = torch.tensor(y_test)
    # 将张量数据集封装为TensorDataset
    train_dataset = torch.utils.data.TensorDataset(x_train_tensor, y_train_tensor)
    test_dataset = torch.utils.data.TensorDataset(x_test_tensor, y_test_tensor)
    return train_dataset, test_dataset
```

这个函数完成了五件事：读取表格、分离输入和答案、划分数据、标准化特征、封装成 PyTorch 数据集。

#### 3.通过列位置区分特征和标签

`pd.read_csv(path)` 默认将 CSV 的第一行作为表头。`iloc` 按行列位置取数据：

- `csv_data.iloc[:, :-1]`：取所有行，以及最后一列之前的所有列，作为输入特征 `x`。
- `csv_data.iloc[:, -1]`：取所有行的最后一列，作为标签 `y`。
- `.values`：将选出的表格数据转换为 NumPy 数组。

这说明程序依赖的是**列顺序**，没有根据列名寻找标签。结合后面的 `input_size = 20`，这份代码要求 CSV 中有 20 列输入特征，最后一列是价格类别；如果混入额外的编号列，也会被当作特征。

假设 CSV 有 `N` 条样本，此时 `x` 的形状是 `[N, 20]`，`y` 的形状是 `[N]`。每一行是一部手机的记录，每个标签对应同一行手机的价格类别。

代码没有提供实际 CSV，因此不能仅凭脚本确定这 20 列的具体名称，也不能确定四个编号对应的价格区间。这里能够确定的是输入维度、标签位置，以及分类计算所要求的标签格式。

`x.astype(np.float32)` 将输入转换为 32 位浮点数，与默认浮点类型下创建的线性层参数相匹配。`y.astype(np.int64)` 将标签转换为 64 位整数，之后对应 PyTorch 的 `torch.int64`，也就是 `torch.long`。

因为输出类别数是 4，这里的有效标签应当是 `0`、`1`、`2`、`3`。标签是一维的类别索引，不是四列的独热编码。`astype` 只转换类型，不会自动把任意原始标签映射到这四个编号，也不会完成缺失值清洗。

#### 4.先划分训练集和测试集

`train_test_split` 同时处理 `x` 和 `y`，返回训练特征、测试特征、训练标签、测试标签，样本与标签的对应关系保持不变。

| 参数            | 含义                    | 这里的思路                         |
| --------------- | ----------------------- | ---------------------------------- |
| `test_size=0.2` | 将约 20% 的样本用于测试 | 其余约 80% 用于学习参数            |
| `stratify=y`    | 按标签分层划分          | 使两部分中的类别比例尽量接近原数据 |
| `shuffle=True`  | 划分前打乱样本顺序      | 避免直接按 CSV 行顺序切分          |

分层划分是保持类别比例，并不会把原本不均衡的数据变成各类别数量相同的数据。每个类别也需要有足够样本，才能满足分层划分的要求。

原代码没有设置 `random_state`。在没有外部固定随机状态的情况下，每次调用都可能得到不同的训练集和测试集，这与最后连续执行五次实验直接相关。

#### 5.为什么训练集用fit_transform，测试集用transform

手机特征可能具有不同的数值范围。标准化会对每一列分别计算，形式可以写成：

```text
标准化后的特征值 =（原始特征值 - 训练集该列的均值）/ 训练集该列的标准差
```

`scaler.fit_transform(x_train)` 包含两个动作：先从训练集学习各列的均值和标准差，再用它们转换训练集。`scaler.transform(x_test)` 则直接复用这些统计量转换测试集。

这种顺序的关键是：**测试集没有参与标准化规则的拟合**。如果先在全部数据上计算统计量，再进行划分，测试数据的信息就会进入预处理过程，造成数据泄漏。

这里没有对 `y` 标准化，因为 `y` 表示类别编号，编号之间的数值差不是需要拟合的价格差。

还要记住一个与后续使用有关的细节：`scaler` 是函数内的局部变量，没有返回，也没有保存。当前这次实验中，测试特征已经转换好，所以可以直接评估；如果之后单独读取权重预测新的手机，仍然需要训练时同一个标准化器，仅有 `.pth` 权重文件不能还原这一步。

#### 6.TensorDataset如何把数据交给训练过程

`torch.tensor(...)` 将 NumPy 数组转换为张量。这里的特征张量是浮点类型，标签张量是整型；它们创建时位于 CPU，后续按批次移动到计算设备。

`TensorDataset(x_train_tensor, y_train_tensor)` 将同一位置的输入和标签配成一对。取第 `i` 个样本时，会一起得到第 `i` 行的 20 个特征和对应的类别编号。

`TensorDataset` 负责组织样本，后面出现的 `DataLoader` 负责分批读取样本。函数最终返回的是两个数据集对象，不是已经创建好的批次，也不是文件路径。

### 二、配置模型参数

#### 1.原模型的定义

```python
# 自定义训练模型
class PhoneClassificationModel(nn.Module):
    def __init__(self, input_size, output_size):
        # 调用父类的构造函数
        super(PhoneClassificationModel, self).__init__()
        # 定义模型的层
        self.linear1 = nn.Linear(input_size, 256)
        self.linear2 = nn.Linear(256, 1024)
        self.linear3 = nn.Linear(1024, 512)
        self.linear4 = nn.Linear(512, 64)
        self.linear5 = nn.Linear(64, 16)
        self.output = nn.Linear(16, output_size)

    # 重写前向传播函数
    def forward(self, input):
        # 定义前向传播的计算过程
        tmp = torch.relu(self.linear1(input))
        tmp = torch.relu(self.linear2(tmp))
        tmp = torch.relu(self.linear3(tmp))
        tmp = torch.relu(self.linear4(tmp))
        tmp = torch.relu(self.linear5(tmp))
        out = self.output(tmp)
        return out
```

这是一个前馈全连接神经网络，也可以称为多层感知机（MLP）。前馈表示数据按照定义的方向逐层计算；全连接表示每层中的每个输出单元都接收上一层的全部输入。

继承 `nn.Module` 后，通过 `super(...)` 初始化父类，再将线性层保存在实例属性中，PyTorch 才能按模块机制管理这些层。这样 `model.parameters()` 可以取得需要训练的参数，`state_dict()` 可以取得模型状态。

`__init__` 定义“有哪些层”，`forward` 定义“数据按什么顺序经过这些层”。调用 `model(inputs)` 时，PyTorch 会通过模块调用机制执行 `forward`。

#### 2.20个特征如何变成4个类别分数

当输入大小为 20、输出大小为 4 时，网络结构如下：

```text
20 → 256 → 1024 → 512 → 64 → 16 → 4
     ReLU   ReLU   ReLU  ReLU  ReLU
```

假设当前批次有 `B` 个样本，张量形状依次变化：

| 位置     | 层定义                 | 输出形状    |
| -------- | ---------------------- | ----------- |
| 输入     | 每部手机的 20 个特征   | `[B, 20]`   |
| 隐藏层 1 | `nn.Linear(20, 256)`   | `[B, 256]`  |
| 隐藏层 2 | `nn.Linear(256, 1024)` | `[B, 1024]` |
| 隐藏层 3 | `nn.Linear(1024, 512)` | `[B, 512]`  |
| 隐藏层 4 | `nn.Linear(512, 64)`   | `[B, 64]`   |
| 隐藏层 5 | `nn.Linear(64, 16)`    | `[B, 16]`   |
| 输出层   | `nn.Linear(16, 4)`     | `[B, 4]`    |

`nn.Linear(a, b)` 对每个样本完成一次带偏置的线性变换，将长度为 `a` 的向量转换为长度为 `b` 的向量，批次维度 `B` 不变。每层的权重和偏置由训练过程学习。

这里共有五个隐藏层和一个输出层，一共六个线性层。20 表示输入特征数，不表示 20 个样本；4 表示类别数，不表示预测四部手机。

从结构可以看出，这份实现先把 20 维输入映射到更宽的表示空间，再逐步压缩为 16 维表示，最后输出四个分数。这有助于理解它的设计方向，但不能仅凭层数和宽度断言该结构最优；代码没有给出与其他结构的对比实验。

#### 3.ReLU与最后一层分别承担什么作用

前五层后面都使用了 `torch.relu`。ReLU 会保留正数，将负数变为 0，为网络加入非线性。若只有连续的线性变换而没有非线性激活，多层线性层仍可以合并成一次线性变换，无法发挥这种多层结构的表达能力。

输出层后面没有 ReLU，也没有 Softmax。它返回四个未经归一化的分数，称为 **logits**，分数可以是正数或负数，合计也不需要等于 1。

这与后面使用的 `nn.CrossEntropyLoss()` 是配套的：在本例的整数标签用法下，交叉熵损失直接接收 logits，并在内部完成相应的对数归一化与损失计算，不需要先把输出变成概率。

评估时也只需要比较哪一项最大，因此可以直接对 logits 使用 `argmax`。

#### 4.区分手动配置与训练得到的参数

实例创建与训练入口如下：

```python
def train(train_dataset):
    # 设置输入和输出的大小
    input_size = 20
    output_size = 4
    # 创建模型实例
    model = PhoneClassificationModel(input_size, output_size)
    # 训练模型
    train_model(model, train_dataset, learning_rate=0.0001)
```

`train()` 的职责是确定输入输出维度、创建新模型，然后调用训练函数。这里的模型刚创建时尚未学习数据，线性层的权重和偏置经过默认随机初始化。

需要区分两类“参数”：

- **模型参数**：各层的权重和偏置，由反向传播和优化器更新。
- **超参数**：隐藏层宽度、训练轮数、批量大小、学习率等，由代码预先指定。

结合下一节 `train_model()` 的函数定义，可以确认本次调用实际使用的配置：

| 配置项     | 实际取值                 | 来源                     |
| ---------- | ------------------------ | ------------------------ |
| 输入特征数 | `20`                     | `train()` 中指定         |
| 输出类别数 | `4`                      | `train()` 中指定         |
| 隐藏层宽度 | `256、1024、512、64、16` | 模型类中指定             |
| 训练轮数   | `100`                    | 沿用 `epochs` 默认值     |
| 批量大小   | `32`                     | 沿用 `batch_size` 默认值 |
| 学习率     | `0.0001`                 | 调用时覆盖默认的 `0.001` |
| 损失函数   | `CrossEntropyLoss`       | 训练函数中创建           |
| 优化器     | `Adam`                   | 训练函数中创建           |

回顾代码时尤其容易忽略学习率：函数定义中虽然写着 `0.001`，主流程实际经过 `train()`，因此使用的是 `0.0001`。

### 三、模型训练

#### 1.训练函数的完整代码

```python
# 训练模型
def train_model(model, dataset, epochs=100, batch_size=32, learning_rate=0.001):
    # 创建数据加载器
    dataloader = torch.utils.data.DataLoader(
        dataset, batch_size=batch_size, shuffle=True
    )
    # 使用交叉熵损失函数
    criterion = nn.CrossEntropyLoss()
    # Adam优化器
    optimizer = optim.Adam(model.parameters(), lr=learning_rate)
    # 设置模型为训练模式
    model.train()
    # 将模型移动到GPU
    model.to(device)

    # 训练循环
    for epoch in range(epochs):
        # 记录每个epoch的开始时间
        start_time = time.time()
        # 初始化累计损失
        total_loss = 0.0

        for inputs, labels in dataloader:
            # 将数据移动到GPU
            inputs, labels = inputs.to(device), labels.to(device)
            # 前向传播
            outputs = model(inputs)
            loss = criterion(outputs, labels)

            # 反向传播和优化
            optimizer.zero_grad()
            loss.backward()
            optimizer.step()

            # 累计损失
            total_loss += loss.item()
        # 记录每个epoch的结束时间
        end_time = time.time()
        print(
            f"Epoch [{epoch + 1}/{epochs}], Loss: {total_loss / len(dataloader):.4f}, Time: {end_time - start_time:.2f}s"
        )

    # 创建保存模型的目录
    save_path = path_prefix + "model/"
    os.makedirs(os.path.dirname(save_path), exist_ok=True)
    # 保存训练好的模型
    torch.save(
        model.state_dict(),
        save_path + "phone_classification_model.pth",
    )
```

#### 2.DataLoader如何组成一个批次

训练数据集包含标准化后的特征和整数标签。`DataLoader` 每次从中取出最多 32 对样本，默认保留最后一个不足 32 条的批次。

对于一个大小为 `B` 的批次：

- `inputs` 的形状为 `[B, 20]`。
- `labels` 的形状为 `[B]`。
- `outputs = model(inputs)` 得到 `[B, 4]`。
- `criterion(outputs, labels)` 得到一个标量损失。

这里的 `shuffle=True` 在每次遍历训练数据时打乱读取顺序，改变批次组合，不会重新划分训练集和测试集，也不会破坏输入与标签的配对。

一轮，也就是一个 epoch，表示完整遍历一次训练集；一个 batch 表示其中的一小批样本。假设训练集有 `M` 条样本，每轮批次数为 `M / 32` 向上取整，当前代码在每个批次更新一次参数，默认完整遍历 100 轮。

#### 3.交叉熵与Adam如何分工

`criterion = nn.CrossEntropyLoss()` 创建交叉熵损失函数。对于每个样本，可以把它理解为：先根据四个分数形成类别概率，再取真实类别概率的负对数；默认对当前批次中的样本损失取平均。

真实类别对应的概率越低，惩罚越大；概率越接近 1，该样本损失越接近 0。它评价的是模型对正确类别的支持程度，不只是最终有没有猜对。因此，两个模型即使准确率相同，也可能有不同的交叉熵损失。

`optimizer = optim.Adam(model.parameters(), lr=learning_rate)` 创建 Adam 优化器，把模型参数交给它管理。Adam 根据梯度及其历史统计量调整更新步长；`learning_rate` 控制整体更新尺度，并不是每次都从参数中减去固定的 `0.0001`。

损失函数负责计算“这次预测偏差多大”，自动求导负责计算“参数怎样变化会影响损失”，优化器负责实际更新参数。

#### 4.训练模式与计算设备

`model.train()` 把模型切换到训练模式。该模型只有线性层和 ReLU，没有 Dropout 或 BatchNorm，所以模式切换不会改变这些层的计算规则，但保留了明确的训练流程。

`model.to(device)` 移动模型参数，每次取出一个批次后，`inputs.to(device)` 和 `labels.to(device)` 再移动该批数据。模型与参与同一次计算的张量需要位于兼容的设备上。

原代码先创建 Adam，再移动模型。回顾时应留意这一顺序：PyTorch 的 `nn.Module.cuda()` 文档明确提醒，迁移会使关联的参数和缓冲区成为不同对象，应在创建优化器前调用。这里实际使用的是 `.to(device)`，不能直接据此断言原代码一定出错；理解设备迁移与优化器的关系时，仍应记住先确定模型设备、再创建优化器的顺序。

#### 5.一个批次怎样完成一次学习

训练内层循环可以顺着下面五步理解：

1. **前向传播**：`outputs = model(inputs)`，用当前权重计算每部手机的四个类别分数。
2. **计算损失**：`loss = criterion(outputs, labels)`，对照真实类别得到当前批次的平均交叉熵。
3. **清除旧梯度**：`optimizer.zero_grad()`，清除上一个批次留下的参数梯度。
4. **反向传播**：`loss.backward()`，沿计算图计算损失对各层权重和偏置的梯度。
5. **更新参数**：`optimizer.step()`，使用刚计算的梯度调整参数。

PyTorch 默认会累加梯度，因此这里每批反向传播之前都要清零。原代码把 `zero_grad()` 放在计算损失之后、`backward()` 之前，在这个普通训练循环中可以正常清除旧梯度。

`backward()` 本身不更新权重，真正执行更新的是 `step()`。更新后，下一个批次就会使用新的参数进行前向传播。

`total_loss = 0.0` 位于每轮开头，因此每轮日志只统计当前轮次，不会一直混入前面所有轮次的损失。

#### 6.日志中的Loss与Time到底表示什么

`loss.item()` 把只有一个元素的损失张量转换为 Python 数值，再加到 `total_loss`。最终打印的 `total_loss / len(dataloader)` 是**各批次平均损失的算术平均值**。

如果每批大小相同，它也等于这些批次按样本数加权的平均值；如果最后一批不足 32 条，该批仍与完整批次占相同权重，所以这不是严格按样本数统计的整轮平均损失。原代码保留这种统计方式，它影响日志的含义，不改变每个批次执行的反向传播步骤。

此外，一轮内模型参数持续更新，各批次损失来自不同的参数状态。这条日志不等于“用本轮结束后的最终模型重新计算整个训练集”的损失。

`Time` 统计从本轮开始到本轮训练循环结束的墙钟耗时，包含数据读取、设备传输和训练计算等开销，不包含循环之后的模型保存。CUDA 运算存在异步执行，这段计时也没有专门的同步计时设计，因此应将它理解为训练日志中的粗略耗时。

原代码没有在训练过程中计算测试准确率或验证损失。单凭 `Loss` 下降，只能说明训练过程中的拟合情况，不能直接证明对未见数据的分类能力提高。

#### 7.保存的是最终权重，不是整个训练过程

`save_path` 的值以 `/` 结尾，因此这里的 `os.path.dirname(save_path)` 指向模型目录。`os.makedirs(..., exist_ok=True)` 在目录不存在时创建目录，已存在时继续执行。

`torch.save(model.state_dict(), ...)` 保存模型状态字典。对于这个网络，主要内容就是各线性层的权重和偏置。

这份文件没有保存模型类的 Python 定义、标准化器、Adam 的内部状态或已训练轮数。因此，它用于按相同结构恢复权重并评估，不能单独还原整个预处理过程，也不是用于完整恢复优化器状态的训练检查点。

保存发生在所有 epoch 结束后，保存的是最后一轮的模型。代码没有验证集、早停逻辑或“表现最好时保存”的判断，不能把这个文件称为已经筛选过的最佳模型。

### 四、模型评估

#### 1.先创建同结构模型，再加载权重

原代码的评估入口如下：

```python
def evaluate(test_dataset):
    # 设置输入和输出的大小
    input_size = 20
    output_size = 4
    # 创建模型实例
    model = PhoneClassificationModel(input_size, output_size)
    # 加载训练好的模型参数
    model.load_state_dict(
        torch.load(path_prefix + "model/phone_classification_model.pth")
    )
    # 将模型移动到GPU
    model.to(device)

    # 评估模型
    evaluate_model(model, test_dataset)
```

`train()` 中的模型是局部变量，训练函数也没有把它返回。评估阶段因此重新创建一个结构相同的对象，再从磁盘恢复参数。

恢复过程按下面的顺序理解：

1. `PhoneClassificationModel(20, 4)` 建立与训练时相同的网络结构。
2. `torch.load(...)` 从文件读出状态字典。
3. `model.load_state_dict(...)` 将字典中的参数复制到对应层中。
4. `model.to(device)` 将恢复后的模型移动到计算设备。
5. `evaluate_model(...)` 使用该模型处理测试集。

刚创建模型时也会随机初始化，但成功加载后，这些初始值由保存的权重覆盖，因此评估用的是训练后的参数。仅知道输入为 20、输出为 4 还不够，中间各层的名称和维度也需要与权重对应。

原代码的 `torch.load()` 没有指定 `map_location`。在同一环境中连续训练和评估时通常沿用相同设备；如果把 GPU 保存的文件拿到只有 CPU 的环境中，加载时可能因设备映射失败。后面的 `model.to(device)` 发生在加载之后，不能解决已经在 `torch.load()` 阶段出现的问题。

#### 2.评估函数的完整代码

```python
def evaluate_model(model, dataset):
    # 创建数据加载器
    dataloader = torch.utils.data.DataLoader(dataset, batch_size=32, shuffle=False)
    # 设置模型为评估模式
    model.eval()

    correct, total = 0, 0

    with torch.no_grad():
        for inputs, labels in dataloader:
            # 将数据移动到GPU
            inputs, labels = inputs.to(device), labels.to(device)
            # 前向传播
            outputs = model(inputs)
            predicted = torch.argmax(outputs.data, 1)
            total += labels.size(0)
            correct += (predicted == labels).sum().item()

    accuracy = 100 * correct / total
    print(f"Accuracy of the model on the test dataset: {accuracy:.2f}%")
```

评估时同样分批读取数据，但 `shuffle=False` 保持测试样本的读取顺序。对于当前这种逐条分类后汇总正确数量的计算，打乱顺序通常不改变准确率；保留顺序更便于对应和检查结果。

#### 3.eval与no_grad为什么同时出现

`model.eval()` 将模型切换到评估模式，影响 Dropout、BatchNorm 等具有训练和评估差异的层。当前网络没有这些层，因此它不会直接改变线性层和 ReLU 的计算结果。

`torch.no_grad()` 则关闭代码块中的梯度记录。评估只需要前向预测，不需要构建用于反向传播的计算图，可以减少相关开销。

两者各有职责：`eval()` 不会自动关闭自动求导，`no_grad()` 也不会自动切换模型模式。评估循环中没有 `backward()` 和 `optimizer.step()`，因此不会更新模型参数。

#### 4.怎样把四个分数转换为一个类别

`outputs` 的形状是 `[B, 4]`，每一行对应一部手机，每一列对应一个类别。`torch.argmax(outputs.data, 1)` 沿第 1 维，也就是类别维度，取最大分数所在的位置，得到形状为 `[B]` 的类别编号。

例如，仅为说明计算规则，假设某个样本的输出如下：

```text
四个类别的分数：[-0.8, 0.3, 2.1, 1.0]
最大分数的位置：2
预测类别：2
```

这里的 2 是从 0 开始计数的类别索引，不是分数值 2.1，也不是具体售价。对同一组 logits 做 Softmax 不会改变最大项的位置，所以计算这个预测类别不需要额外做 Softmax。

原代码使用了 `outputs.data`。这个属性可以访问脱离自动求导跟踪的数据，但评估已经处在 `no_grad()` 中，因此这里并不需要额外依赖 `.data` 来关闭梯度。理解原实现时可以把注意力放在“按类别维取最大位置”上；不要把 `.data` 的用法推广到需要梯度的训练计算中。

#### 5.准确率如何累计

`total += labels.size(0)` 统计当前批次的样本数，包括最后一个不足 32 条的批次。

`predicted == labels` 对预测编号和真实编号逐个比较，得到布尔张量；`.sum()` 将预测正确的位置计数，`.item()` 转成 Python 数值，累加到 `correct`。

所有批次处理完后：

```text
准确率（%）= 预测正确的测试样本数 / 测试样本总数 × 100
```

这里先累计全体测试样本的正确数和总数，再做一次除法，因此与训练日志中“按批次平均损失再平均”的统计方式不同。最后一批较小时，不会因为批次大小不同而获得额外权重。

代码打印的是这一次划分上的整体测试准确率，没有输出各类别的准确情况、混淆矩阵、精确率或召回率。如果类别比例不均衡，单个整体准确率也不能说明每类手机都识别得一样好。

#### 6.回到主入口，理解五次完整实验

```python
if __name__ == "__main__":
    for i in range(5):
        print(f"Training and evaluating model iteration {i + 1}")
        train_dataset, test_dataset = create_dataset(path_prefix + "data/train.csv")
        # 训练模型
        train(train_dataset)
        # 评估模型
        evaluate(test_dataset)
```

`if __name__ == "__main__"` 表示这段循环在脚本被直接运行时执行；作为模块导入时不会自动开始训练。

每次循环都按下面顺序完成一套流程：

1. 读取同一个 `train.csv`，重新划分训练集和测试集。
2. 使用本次训练集拟合新的标准化器，并转换两部分特征。
3. 在 `train()` 中创建一个新模型，按实际学习率 `0.0001` 训练 100 轮。
4. 将这次训练结束后的权重保存到固定文件。
5. 在 `evaluate()` 中创建同结构模型，加载刚保存的权重，评估本次测试集。

所以，外层五次循环表示**五次重新开始的训练与评估实验**。它不是让同一个模型接着训练五次，也不是使用五个模型共同预测。

它也不是五折交叉验证。五折交叉验证会把样本组织为五个互不重叠的折，并轮流将其中一折用于验证；这里是重复进行随机分层留出划分，不同轮次的测试集可能包含相同样本。

未固定的数据划分、模型随机初始化和训练批次顺序，都可能让五次准确率有所不同。原代码只分别打印结果，没有计算均值、标准差，也没有选择或保留五次中的最佳模型。

五次保存使用的是同一个文件名，因此后一次会覆盖前一次；脚本正常完成后，磁盘上留下的是第五次训练的权重。每次评估都紧跟本次保存，使用的则是对应这次实验的数据划分和权重。

#### 7.重新阅读时，沿着数据和参数各走一遍

回到这份代码，可以用两条路径检查自己是否重新理解了实现：

```text
数据路径：
CSV → 特征与标签 → 分层划分 → 训练统计量标准化
    → TensorDataset → DataLoader → 一批特征 → 四个类别分数
    → argmax → 与真实标签比较 → 测试准确率

参数路径：
创建网络并初始化权重 → 计算交叉熵 → 清除旧梯度
    → 反向传播 → Adam 更新 → 重复批次与轮次
    → 保存 state_dict → 同结构网络加载权重 → 评估
```

训练时，真实标签通过损失函数影响参数更新；评估时，真实标签只用于统计预测是否正确。标准化器决定输入如何转换，网络权重决定转换后的输入如何映射到类别分数。这两部分共同决定后续预测行为，也是重新接手这份 demo 时需要一起记住的状态。

### 五、官方参考资料

- [scikit-learn：train_test_split](https://scikit-learn.org/stable/modules/generated/sklearn.model_selection.train_test_split.html)
- [scikit-learn：StandardScaler](https://scikit-learn.org/stable/modules/generated/sklearn.preprocessing.StandardScaler.html)
- [PyTorch：nn.Linear](https://docs.pytorch.org/docs/stable/generated/torch.nn.Linear.html)
- [PyTorch：nn.Module.cuda](https://docs.pytorch.org/docs/stable/generated/torch.nn.Module.html#torch.nn.Module.cuda)
- [PyTorch：CrossEntropyLoss](https://docs.pytorch.org/docs/stable/generated/torch.nn.CrossEntropyLoss.html)
- [PyTorch：优化器与参数管理](https://docs.pytorch.org/docs/stable/optim.html)
- [PyTorch：保存和加载模型](https://docs.pytorch.org/tutorials/beginner/saving_loading_models.html)
