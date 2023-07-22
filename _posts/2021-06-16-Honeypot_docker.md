---
layout: post
title:  "Cowrie"
date:   2021-06-16 08:04:29 +0200
last_modified_at: 2021-06-16 08:05:29 +0200
toc:  true
tags: [cowrie, honeypot, Ubuntu, blueteam, Docker]
categories: Utility
---

With a honeypot we can collect many indicators that we can use later on

---

##  Honeypot in Docker 

While I was searching about honeypot I found this topic that is honeypot in docker I found it interesting because it saves us a lot of things in terms of configuration:

This installation was carried out in a:
![](/images_blog/img_honeypot/Pastedimage20210616165257.png)
![Pastedimage20210616165257](https://user-images.githubusercontent.com/76759292/127757859-f8dec979-4a62-44a7-8e3d-9b96fac7a59e.png)


Looking for honeypot in docker I found one that is cowrie this has a normal installation and one with docker it is worth noting that the normal installation of cowrie has to give what is a redirection with iptables (This if we want it to be credible) in this case docker can be said that saves you that part.

### Cowrie

To install cowrie you don't need to have a great knowledge in docker, here is how to install it:

[Docker Installation](https://www.digitalocean.com/community/tutorials/how-to-install-and-use-docker-on-ubuntu-20-04)


How the honeypot runs:

```bash
 docker run -d -p 22:2222 cowrie/cowrie
```

We are indicating that port 2222 of the container is port 22 of our server:  
![](/images_blog/img_honeypot/Pastedimage20210616183231.png)
![Pastedimage20210616183231](https://user-images.githubusercontent.com/76759292/127757867-fb546971-3f50-4bbf-85b4-337b07ba3980.png)


With the -d option we tell it to run in background. (The reason is so that it does not come out so much noise)

### Test

From another machine I run an nmap to see how it responds:

Before:
```bash
nmap -sV -sC -p22 192.168.204.136
Starting Nmap 7.91 ( https://nmap.org ) at 2021-06-16 18:07 EDT
Nmap scan report for 192.168.204.136
Host is up (0.00044s latency).

PORT   STATE  SERVICE VERSION
22/tcp closed ssh

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 0.58 seconds
```

after:
```bash
nmap -sV -sC -p22 192.168.204.136
Starting Nmap 7.91 ( https://nmap.org ) at 2021-06-16 18:11 EDT
Nmap scan report for 192.168.204.136
Host is up (0.00047s latency).

PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 6.0p1 Debian 4+deb7u2 (protocol 2.0)
| ssh-hostkey: 
|   1024 e9:7a:90:03:07:17:e3:29:06:1c:0d:89:aa:49:ad:a4 (DSA)
|_  2048 0a:4c:ef:bb:a3:b2:68:fb:0f:2b:c2:14:12:ed:98:66 (RSA)
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 0.92 seconds
```


To view the logs, which would be the most interesting part, it is done in the following way:

Enter the container and in ```/var/var/log/cowrie/cowrie.json``` are the logs.
(To enter the container it is ```docker exec -it <ID> bash```)

![](/images_blog/img_honeypot/Pastedimage20210616190736.png)
![Pastedimage20210616190736](https://user-images.githubusercontent.com/76759292/127757871-f5e5eeef-d9e5-4809-96ee-fa6df42a190d.png)


## Opinion

It seems to me a good option to consider if we want to give a little more security to our server, it should be noted that to make it work you must touch other settings that may be that I touch it in another article, the implementation seemed relatively simple and the way to see the logs alike.

In conclusion it seems to me an interesting option to try. I may also do other articles on honeypot.

<p align="center">
<img src="https://tenor.com/view/honeypot-yum-gif-19589195.gif" width="250" height="250" />
</p>




