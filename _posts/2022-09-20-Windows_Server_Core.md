---
layout: post
title:  "Windows Server Core I"
date:   2022-09-20 20:05:29 -0400
last_modified_at: 2022-09-20 20:05:29 -0400
toc:  true
tags: [windows, sysadmin]
categories: Windows
---

Advantages and disadvantages of using windows server core
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

![install_feature](https://user-images.githubusercontent.com/76759292/191386174-82ebd5cf-3515-4ee9-ae93-4267ab3b1534.png)

Verify if the installation is sucess:

`Get-WindowsFeature -Name *AD*`

![feature](https://user-images.githubusercontent.com/76759292/191386234-d083a769-129e-4dbe-99d1-ac3ac217fc9f.png)

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

![install_addforest](https://user-images.githubusercontent.com/76759292/191386272-f675f3ac-724e-4407-9d6e-c7b5fdeb7968.png)

![installation](https://user-images.githubusercontent.com/76759292/191386296-31db6112-7862-45f3-afab-0be8ff8ebdea.png)


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
![access](https://user-images.githubusercontent.com/76759292/191386317-1f23364d-bb60-45f8-a337-4cb282d3d5f6.png)

# Remote management

The concept here is that we can control the server remotely. I'm using Windows 10 in this instance. Putting in place the capability:

```powershell
Add-WindowsCapability –online –Name “Rsat.ActiveDirectory.DS-LDS.Tools~~~~0.0.1.0”
```


Go to the user and computer active directory once this section is complete, or the best option is to go to mmc.exe and add complement:

![mmc](https://user-images.githubusercontent.com/76759292/191386349-915ef1db-bb6b-49c6-8bee-3e52db1a92da.png)


The user and computer active directory is another option for directly connecting to the Domain Controller:

![user_computers](https://user-images.githubusercontent.com/76759292/191386365-e413d1bb-08cf-49ce-98cb-817b68e24cc7.png)


# Advantage

[Usage in Powershell](https://gist.github.com/b3nj1-1/682b9e63c8270cd02518441a29099fd8)

If we look at it we realize that in consumption we really notice a change:

## Windows Server Core
![process_monitor](https://user-images.githubusercontent.com/76759292/191386400-e78b0f25-75b0-4f9a-a8be-9ec956ca8bf8.png)

## Windows Server GUI

![process2](https://user-images.githubusercontent.com/76759292/191386417-c8900916-4e9e-492d-acdd-25ac0035da34.png)


# Disadvantage

One disadvantage we have is that some roles cannot be installed here but we have alternatives.
