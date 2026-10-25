---
title: iPhone通过USB给Windows电脑共享网络教程
typora-root-url: iPhone通过USB给Windows电脑共享网络教程
date: 2026-07-29 19:05:13
updated: 2026-10-25 23:47:45
categories:
    - 网络应用
tags:
    - iPhone
    - Windows
    - USB网络共享
---

### 一、引言

Windows电脑临时断网、没有无线网卡，或者所在环境不方便使用Wi-Fi时，可以用数据线把iPhone的蜂窝网络共享给电脑。与无线热点相比，USB共享通常更稳定，也能在使用网络的同时给手机充电。

真正容易卡住的是“电脑本来就没有网络，而且尚未安装Apple驱动”的情况。此时Windows可能只能读取iPhone照片，无法出现`Apple Mobile Device Ethernet`网络适配器。**本文重点介绍离线安装：先把完整驱动包送到电脑，再安装设备支持组件和网卡驱动，最后开启个人热点。**

### 二、使用前的准备

开始前需要准备：

- 一台能够正常使用蜂窝数据的iPhone；
- 一台Windows 10或Windows 11电脑；
- 一根支持数据传输的Lightning或USB-C数据线；
- iPhone套餐和运营商支持“个人热点”功能；
- Windows电脑具备管理员权限。

需要注意，部分便宜数据线只有充电功能，不能传输数据。连接后如果Windows完全没有设备提示，优先更换原装线、MFi认证线或确认支持数据传输的USB-C线。

USB共享消耗的是iPhone的蜂窝流量，不是手机当前连接的Wi-Fi。使用前建议确认套餐余量，Windows Update、网盘同步、游戏平台更新等后台任务可能在短时间内产生大量流量。

### 三、连接原理

iPhone通过USB共享网络时，Windows需要先识别两个部分：

| 组件                    | 作用                    | 正常表现                                       |
| ----------------------- | ----------------------- | ---------------------------------------------- |
| Apple移动设备USB驱动    | 让Windows正确识别iPhone | 设备管理器中能看到Apple移动设备                |
| Apple移动设备以太网驱动 | 创建USB虚拟网卡         | 网络适配器中出现`Apple Mobile Device Ethernet` |

因此，“电脑能看到iPhone照片”并不代表网络共享驱动已经正常。Windows通过PTP协议读取照片时，只需要相机相关能力；USB网络共享还需要Apple移动设备以太网驱动。

### 四、常规方法：安装Apple设备并连接

电脑可以联网时，按照[Apple官方说明](https://support.apple.com/zh-cn/111785)完成下面几步：

1. 从Microsoft Store安装[Apple设备](https://apps.microsoft.com/detail/9np83lwlpz9k)，或从Apple官方渠道安装Windows版iTunes。
2. 在iPhone中打开“蜂窝数据”，进入“设置 → 个人热点”，开启“允许其他人加入”。
3. 用支持数据传输的USB线连接电脑，解锁iPhone，出现提示时点击“信任”并输入锁屏密码。
4. 等待Windows识别网卡，再打开网页验证联网。需要查看适配器时，按`Win`+`R`，输入`ncpa.cpl`，检查描述中包含`Apple Mobile Device Ethernet`的以太网连接。

如果电脑没有任何可用网络，无法下载应用或驱动，继续按下一章操作。

### 五、电脑完全离线时安装驱动

离线安装要解决两个问题：**准备完整的驱动文件，以及把它们传进电脑。** 有U盘时直接复制最方便；只有iPhone、电脑又只能读取照片时，可以把压缩包附加到PNG图片末尾，通过照片通道传输。

#### 1.确认系统和解压工具

下面的`AppleMobileDeviceSupport64.msi`及两套驱动按**Windows 10/11 x64，也就是Intel或AMD的64位系统**准备。可以在“设置 → 系统 → 系统信息（关于）”查看系统类型；ARM64设备不要直接套用这套x64驱动。

离线电脑还需要能打开CAB、ZIP和图片附加包的解压工具，下面以[7-Zip](https://7-zip.org/download.html)为例。**如果电脑没有安装解压软件，用U盘传文件时要一并带上7-Zip安装程序；只有iPhone的照片传输路线，则需要电脑事先已有能读取图片附加包的工具。**

先根据手边设备选择路线：

| 手边条件                                     | 操作路线                                        |
| -------------------------------------------- | ----------------------------------------------- |
| 有另一台联网电脑和U盘                        | 按第2～4小节准备并复制驱动，再跳到第6小节安装   |
| 只有iPhone和离线电脑，电脑已有解压工具       | 直接看第5小节，使用参考作者提供的图片包         |
| 有联网电脑准备文件，但无法直接复制到目标电脑 | 按第2～3小节准备驱动，再按第5小节自行制作图片包 |

#### 2.从iTunes安装包提取设备支持组件

在另一台能够联网的电脑上操作：

1. 从[Apple官方下载入口](https://www.apple.com/itunes/download/win64)获取Windows x64版iTunes安装程序。
2. 右键安装程序，用7-Zip选择“打开压缩包”，**此时不需要运行iTunes安装向导**。
3. 找到`AppleMobileDeviceSupport64.msi`，点击“提取”，保存到新建的`AppleDrivers`文件夹中。

![用7-Zip打开iTunes安装程序并提取AppleMobileDeviceSupport64.msi](../iPhone通过USB给Windows电脑共享网络教程/extract-itunes-support.png)

_图1：提取红色箭头指向的设备支持组件。这里需要完整的MSI文件。_

这个组件用于安装Apple移动设备支持服务和基础组件。USB驱动和网络驱动还要继续准备，不能只复制这个MSI就结束。

#### 3.下载两套驱动并完整打包

[Apple Mobile Drivers Installer项目](https://github.com/NelloKudo/Apple-Mobile-Drivers-Installer)提供了手动离线安装说明，所需CAB文件来自Microsoft的驱动下载服务器：

| 文件                    | 下载地址                                                                                                                                                                                 | 解压到本文示例目录         |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- |
| Apple USB驱动           | [下载USB驱动CAB](https://catalog.s.download.windowsupdate.com/d/msdownload/update/driver/drvs/2020/11/01d96dfd-2f6f-46f7-8bc3-fd82088996d2_a31ff7000e504855b3fa124bf27b3fe5bc4d0893.cab) | `AppleDrivers\AppleUSB`    |
| Apple移动设备以太网驱动 | [下载以太网驱动CAB](https://catalog.s.download.windowsupdate.com/c/msdownload/update/driver/drvs/2017/11/netaapl_7503681835e08ce761c52858949731761e1fa5a1.cab)                           | `AppleDrivers\AppleTether` |

1. 分别下载两个`.cab`文件，并在`AppleDrivers`下新建`AppleUSB`和`AppleTether`文件夹。
2. 用7-Zip打开每个CAB，选择“提取”，把**全部文件**分别解压到对应目录。
3. 确认USB驱动目录里有`AppleUsb.inf`，以太网驱动目录里有`netaapl64.inf`，同时保留各自的`.sys`、`.cat`、`.dll`等配套文件。
4. 将整个`AppleDrivers`文件夹压缩为`AppleDrivers.zip`，便于一次传输。

![两个CAB中的INF安装描述文件及配套驱动文件](../iPhone通过USB给Windows电脑共享网络教程/complete-driver-files.png)

_图2：箭头标出两个INF安装入口，解压时仍需选择全部文件，不是只提取箭头指向的文件。_

整理后的目录关系如下，文件名大小写不影响识别：

```text
AppleDrivers
├─ AppleMobileDeviceSupport64.msi
├─ AppleUSB
│  ├─ AppleUsb.inf
│  ├─ AppleKmdfFilter.sys
│  ├─ AppleLowerFilter.sys
│  ├─ appleusb.cat
│  └─ AppleUsbFilter.dll
└─ AppleTether
   ├─ netaapl64.inf
   ├─ netaapl64.sys
   ├─ netaapl64.cat
   ├─ netaapl64.pdb
   └─ WdfCoInstaller01009.dll
```

上面列出的是配图中两套驱动的文件。下载包包含其他文件时也应全部保留，目录关系以实际CAB为准。**`.inf`只是安装说明，Windows还要读取同目录中的驱动代码和签名；仅打包两个INF无法完成安装。**

在制作文件的电脑上，进入ZIP所在目录，记录校验值：

```powershell
Get-FileHash .\AppleDrivers.zip -Algorithm SHA256
```

SHA-256用于检查传输前后的文件是否一致。自行打包的ZIP需要使用自己记录的结果，不能拿其他包的校验值比较。

#### 4.有U盘时直接复制

1. 将`AppleDrivers.zip`复制到U盘，离线电脑缺少7-Zip时也带上它的安装程序。
2. 在离线电脑上，将文件复制到本地文件夹，例如`C:\AppleOffline`。
3. 在该文件夹打开PowerShell，运行上面的`Get-FileHash`命令，与制作时记录的结果比较。
4. 结果一致后，将ZIP全部解压；不要直接在压缩包窗口里安装驱动。

完成后跳到第6小节。下面的图片传输用于没有U盘等可用传输方式的情况。

#### 5.只有iPhone时，通过照片通道传输

iPhone的“文件”应用里即使已经下载了ZIP，Windows的照片目录也不会直接显示它。参考文章使用的办法是制作“图种”：**把ZIP附加到PNG图片末尾，照片工具仍能显示图片，解压工具则读取后面的压缩内容。** 单纯将`.zip`改名为`.png`没有这个效果。

**使用参考作者准备的图片包**

如果身边没有另一台联网电脑，可以在iPhone的Safari中打开参考作者发布的图片包：

- [图片包下载地址1：EdgeOne](https://cdn1.blog.leao9203.cn/share_file/20251204/Apple%E8%8B%B9%E6%9E%9C%E6%9C%89%E7%BA%BF%E9%A9%B1%E5%8A%A8.png)

这个链接是参考作者整理的第三方驱动包。希望自己从Apple、Microsoft获取原始文件时，按前面的小节准备，再用下面的命令制作图片包。

**自行制作图片包**

在准备驱动的联网电脑上，将一张普通PNG图片命名为`cover.png`，与`AppleDrivers.zip`放在同一目录。在该目录打开PowerShell，执行：

```powershell
cmd /c copy /b "cover.png"+"AppleDrivers.zip" "AppleDrivers.png"
Get-FileHash .\AppleDrivers.png -Algorithm SHA256
```

`copy /b`是Windows命令提示符中的二进制拼接命令，因此在PowerShell里通过`cmd /c`调用。命令中的文件名可按实际情况替换，输出文件不要与已有文件重名。

先用7-Zip打开生成的`AppleDrivers.png`，确认能看到驱动文件，再把它放到一个iPhone Safari可以直接打开的HTTPS下载地址，并记下刚计算出的SHA-256。

![使用7-Zip打开附加了驱动压缩包的PNG图片](../iPhone通过USB给Windows电脑共享网络教程/open-image-archive.png)

_图3：参考作者的图片包被7-Zip作为压缩包打开。图中把文件放在同一目录，本文自行整理时使用两个子目录，安装入口相同。_

**保存到照片并复制到电脑**

1. 在iPhone Safari中打开图片包地址，等待页面中的原图完整加载；参考作者的文件约38.5 MiB，不要在进度条尚未结束时保存。
2. 长按图片，选择“存储到‘照片’”或“保存到照片”。不要保存本文中的步骤截图，要保存下载链接对应的原始图片包。
3. 用数据线连接离线电脑，解锁iPhone，出现提示时点击“信任”并输入密码。
4. 在Windows文件资源管理器中打开“此电脑 → Apple iPhone → Internal Storage”，进入最新的照片文件夹。
5. 找到刚保存的PNG，复制到电脑本地。手机可能将它改名为`IMG_9012.PNG`一类的名称，可以结合缩略图、保存时间与文件大小确认。

![Safari长按图片后保存到照片的菜单](../iPhone通过USB给Windows电脑共享网络教程/save-image-to-photos.png)

_图4：等原始图片包加载完整后，再保存到“照片”。_

![在Windows中从iPhone照片目录复制PNG驱动图片包](../iPhone通过USB给Windows电脑共享网络教程/copy-image-from-iphone.png)

_图5：从照片目录复制到电脑，截图里的目录和文件名只作示例。_

不要通过会压缩图片的聊天渠道中转，也不要编辑、裁剪或重新导出图片，否则附加数据可能被移除。

**校验并提取全部文件**

在离线电脑上打开PowerShell，进入图片包所在目录并计算校验值。例如，复制后的文件叫`IMG_9012.PNG`时执行：

```powershell
Get-FileHash .\IMG_9012.PNG -Algorithm SHA256
```

参考作者在原文中公布的图片包SHA-256为：

```text
f8b762abb1d5ec1fc03b4c24200180fd2808f2e48f55d10431a626ccb68bb82a
```

这个值只用于上述作者提供的图片包；自行制作时应对照自己记录的PNG校验值。文件被改名不会改变校验值，内容被改动才会改变。

结果一致后，用7-Zip打开复制到电脑的PNG，把**全部内容**提取到本地文件夹。如果提示“无法作为压缩包打开”或校验不一致，先重新下载、保存并传输，不要继续安装。解压完成后应能找到一个MSI、两个INF，以及各自的全部配套文件。

#### 6.安装设备支持组件和两套驱动

驱动必须从解压后的本地目录安装，保持所有配套文件在原位置：

1. 双击`AppleMobileDeviceSupport64.msi`，按向导完成安装，系统询问管理员权限时确认。
2. 找到`AppleUsb.inf`，右键选择“安装”；Windows 11若未直接显示此选项，先点“显示更多选项”。
3. 找到`netaapl64.inf`，同样右键选择“安装”。
4. 安装完成后重启Windows，再连接iPhone。

参考作者的图片包与本文自行制作的目录结构不同，按实际解压结果寻找这三个安装入口即可。**右键安装INF时，Windows仍会读取同目录的其他文件，不要把INF单独复制到桌面。**

如果右键没有“安装”选项、提示不支持此安装方式，或希望从命令行安装两套驱动，以管理员身份打开PowerShell，进入本文示例中的`AppleDrivers`目录，执行：

```powershell
pnputil /add-driver ".\AppleUSB\*.inf" /subdirs /install
pnputil /add-driver ".\AppleTether\*.inf" /subdirs /install
```

`pnputil`是Windows自带的驱动管理工具。这组命令可替代两个INF的右键安装操作，MSI仍需先安装。使用参考作者的图片包时，可以在**确认只包含这两套可信驱动**的解压目录里执行：

```powershell
pnputil /add-driver ".\*.inf" /subdirs /install
```

查看命令输出，确认驱动包成功添加；如果设备当前未连接，重新连接后再检查是否匹配加载。若提示签名或文件缺失，先核对完整解压和文件校验结果，不要关闭Windows的驱动签名验证。

#### 7.开启个人热点并确认联网

1. 在iPhone中打开蜂窝数据，先确认手机可以通过蜂窝网络访问网页。
2. 进入“设置 → 个人热点”，打开“允许其他人加入”。
3. 用数据线重新连接Windows，保持手机解锁，按提示信任电脑。
4. 按`Win`+`R`，输入`ncpa.cpl`，检查是否新增描述包含`Apple Mobile Device Ethernet`的以太网连接。
5. 在Windows浏览器中访问网页，确认电脑已经可以联网。

需要进一步检查时，在PowerShell中运行：

```powershell
Get-NetAdapter | Where-Object InterfaceDescription -Like "*Apple*"
ipconfig
```

Apple网卡应处于已连接状态，并自动取得IPv4地址和网关；地址可能类似`172.20.10.x`，无需手动照填。能看到照片、安装命令显示成功，都不能单独替代最后的联网验证。

### 六、流量与安全建议

把iPhone连接到Windows后，电脑会把它当作普通网络使用。为了避免后台程序快速消耗流量，可以在Windows的“设置 → 网络和Internet → 以太网”中，把Apple对应的网络设为“按流量计费的连接”。

还建议：

- 不使用时及时关闭个人热点；
- 设置强热点密码；
- 不要在公共电脑上选择“信任”；
- 使用完公共电脑后，在iPhone中还原位置与隐私；
- 驱动只从Apple、Microsoft或可信开源项目的官方页面获取；
- 安装离线包前核对数字签名和SHA-256校验值。

### 七、总结

iPhone通过USB给Windows共享网络，关键不是手动创建网络连接，而是让Windows正确加载Apple移动设备USB和以太网驱动。

电脑完全离线时，按第五章准备完整的MSI和两套驱动，用U盘复制，或通过iPhone照片通道传入图片附加包。确认校验值一致、全部解压后，依次安装MSI、USB驱动和以太网驱动，再打开个人热点并验证联网。

### 八、参考资料

- [连接到iPhone或iPad的个人热点 - Apple支持](https://support.apple.com/zh-cn/111785)
- [共享iPhone的互联网连接 - iPhone使用手册](https://support.apple.com/zh-cn/guide/iphone/iph45447ca6/ios)
- [如果电脑无法识别iPhone或iPad - Apple支持](https://support.apple.com/zh-cn/108643)
- [Apple Devices - Microsoft Store](https://apps.microsoft.com/detail/9np83lwlpz9k)
- [Apple Mobile Drivers Installer - GitHub](https://github.com/NelloKudo/Apple-Mobile-Drivers-Installer)
- [PnPUtil命令语法 - Microsoft Learn](https://learn.microsoft.com/zh-cn/windows-hardware/drivers/devtest/pnputil-command-syntax)
- [iPhone给无网环境的Windows通过有线共享网络](https://blog.leao9203.cn/post/20251204234242/)
