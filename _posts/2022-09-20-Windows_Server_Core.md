---
layout: post
title:  "How to install Windows Server Core"
date:   2022-09-20 20:05:29 -0400
last_modified_at: 2022-09-20 20:05:29 -0400
toc:  true
tags: [windows, sysadmin]
categories: Sysadmin
---

Windows Server Core

---

# Reason

The primary goal of this post is to illustrate the use core advantages.

# Requirements

* 2 Adapter.
* Windows Server Core 2016.
* Windows 10 (testing).

# Setup 

First, change the server name:

```powershell
PS C:\Users\Administrator> Rename-Computer -NewName beeklabs
WARNING: The changes will take effect after you restart the computer WIN-FOQJI0KAEKI.
```

It's necessary to have a fixed ip:

```powershell
PS C:\Users\Administrator> ipconfig

Windows IP Configuration


Ethernet adapter Ethernet:

   Connection-specific DNS Suffix  . : lan
   Link-local IPv6 Address . . . . . : fe80::9929:4133:7a5b:b62d%5
   IPv4 Address. . . . . . . . . . . : 10.0.2.15
   Subnet Mask . . . . . . . . . . . : 255.255.255.0
   Default Gateway . . . . . . . . . : 10.0.2.2

Ethernet adapter Ethernet 2:

   Connection-specific DNS Suffix  . :
   Link-local IPv6 Address . . . . . : fe80::d021:295b:832a:2403%9
   IPv4 Address. . . . . . . . . . . : 192.168.56.111
   Subnet Mask . . . . . . . . . . . : 255.255.255.0
   Default Gateway . . . . . . . . . :
```


# Change IP

Since I don't have a router or firewall in this situation, I entered the same IP in both the gateway and IP:

```powershell
New-NetIPAddress -InterfaceAlias 'Ethernet 2' -IPAddress 192.168.50.1 -AddressFamily IPv4 -PrefixLength 24 -Defaul
tGateway 192.168.50.1
```

# DNS 

I don't have a DNS server, so just use the same server:

```powershell
PS C:\Users\Administrator>  Set-DnsClientServerAddress -InterfaceAlias Ethernet -ServerAddresses 192.168.50.1
```

# Active Directory

Lets go to start:

```powershell
Install-WindowsFeature AD-Domain-Services –IncludeManagementTools -Verbose
```


![[install_feature.png]]
Verify if the installation is sucess:

`Get-WindowsFeature -Name *AD*`

![[feature.png]]

After completing the above steps going to deploy the domain:

```powershell
PS C:\Users\Administrator> Get-Command -Module ADDSDeployment

CommandType     Name                                               Version    Source
-----------     ----                                               -------    ------
Cmdlet          Add-ADDSReadOnlyDomainControllerAccount            1.0.0.0    ADDSDeployment
Cmdlet          Install-ADDSDomain                                 1.0.0.0    ADDSDeployment
Cmdlet          Install-ADDSDomainController                       1.0.0.0    ADDSDeployment
Cmdlet          Install-ADDSForest                                 1.0.0.0    ADDSDeployment
Cmdlet          Test-ADDSDomainControllerInstallation              1.0.0.0    ADDSDeployment
Cmdlet          Test-ADDSDomainControllerUninstallation            1.0.0.0    ADDSDeployment
Cmdlet          Test-ADDSDomainInstallation                        1.0.0.0    ADDSDeployment
Cmdlet          Test-ADDSForestInstallation                        1.0.0.0    ADDSDeployment
Cmdlet          Test-ADDSReadOnlyDomainControllerAccountCreation   1.0.0.0    ADDSDeployment
Cmdlet          Uninstall-ADDSDomainController                     1.0.0.0    ADDSDeployment
```

# Forest

[Read More](https://docs.microsoft.com/en-us/powershell/module/addsdeployment/install-addsdomaincontroller?view=windowsserver2022-ps)

Active Directory forest installation:

```powershell
Install-ADDSForest -DomainName beeklabs.com -ForestMode Win2012 -DomainMode Win2012 -DomainNetbiosName BEEK -Instal
lDns:$true
```

I've provided the link above in case you're interested in learning more about why it requests a password:

![[install_addforest.png]]

![[installation.png]]

# Verify

Checking :

```powershell
Get-ADDomainController -Discover


Domain      : beeklabs.com
Forest      : beeklabs.com
HostName    : {beeklabs.beeklabs.com}
IPv4Address : 192.168.50.1
IPv6Address :
Name        : BEEKLABS
Site        : Default-First-Site-Name
```

Other ways to verify if the installation is sucess:

```powershell
PS C:\Windows\system32> Get-Service ADWS,Kdc,Netlogon,dns

Status   Name               DisplayName
------   ----               -----------
Running  ADWS               Active Directory Web Services
Running  dns                DNS Server
Running  Kdc                Kerberos Key Distribution Center
Running  Netlogon           Netlogon
```

Add machine:

![[access.png]]

# Remote management

The concept here is that we can control the server remotely. I'm using Windows 10 in this instance. Putting in place the capability:

```powershell
Add-WindowsCapability –online –Name “Rsat.ActiveDirectory.DS-LDS.Tools~~~~0.0.1.0”
```


Go to the user and computer active directory once this section is complete, or the best option is to go to mmc.exe and add complement:


![[mmc.png]]


The user and computer active directory is another option for directly connecting to the Domain Controller:

![[user_computers.png]]


# Advantage

[Usage in Powershell](https://gist.github.com/b3nj1-1/682b9e63c8270cd02518441a29099fd8)

If we look at it we realize that in consumption we really notice a change:

## Windows Server Core

![[process_monitor.png]]
## Windows Server GUI
![[process2.png]]

# Disadvantage

One disadvantage we have is that some roles cannot be installed here but we have alternatives.
