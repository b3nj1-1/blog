---
layout: post
title:  "Honeypot en Docker"
date:   2021-06-16 08:04:29 +0200
last_modified_at: 2021-06-16 08:05:29 +0200
toc:  true
tags: [cowrie, honeypot, Ubuntu, blueteam, review, Docker, Devops]
categories: Utilidades
---

{: .message}

##  Honeypot en Docker 

Mientras buscaba sobre honeypot di con este tema que es honeypot en docker me parecio interesante porque nos ahorra muchas cosas en tema de configuración:

Esta instalación se llevo acabo en un:
![](/images_blog/img_honeypot/Pastedimage20210616165257.png)
![Pastedimage20210616165257](https://user-images.githubusercontent.com/76759292/127757859-f8dec979-4a62-44a7-8e3d-9b96fac7a59e.png)


Buscando honeypot en docker di con uno que es cowrie este tiene una instalación normal y una con docker  cabe destacar que la instalacion normal de cowrie se tiene que da lo que es una redireccion con iptables (Esto si queremos que sea creible) en este caso docker se puede decir que te ahorra esa parte.

### Cowrie

Para instalar cowrie no necesitas tener un gran conociemiento en docker,  aqui te dejo como instalarlo:

[Docker Installation](https://www.digitalocean.com/community/tutorials/how-to-install-and-use-docker-on-ubuntu-20-04)


Como corre el honeypot:

```bash
 docker run -d -p 22:2222 cowrie/cowrie
```

Le estamos indicando que el puerto 2222 del contenedor sea el 22 de nuestro servidor: 
![](/images_blog/img_honeypot/Pastedimage20210616183231.png)
![Pastedimage20210616183231](https://user-images.githubusercontent.com/76759292/127757867-fb546971-3f50-4bbf-85b4-337b07ba3980.png)


Con la opcion -d le indicamos que corra en background. (El motivo es para que no salga tanto ruido)

### Prueba

Desde otra maquina le lanzo un nmap para ver como responde:

Antes:
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

Despues:
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


Para ver los logs que eso seria la parte mas interesante se hace de la siguiente forma:

Entra al contededor y en ```/var/log/cowrie/cowrie.json``` estan los logs.
(Para entrar al contenedor es ```docker exec -it <ID> bash```)

![](/images_blog/img_honeypot/Pastedimage20210616190736.png)
![Pastedimage20210616190736](https://user-images.githubusercontent.com/76759292/127757871-f5e5eeef-d9e5-4809-96ee-fa6df42a190d.png)


## Opinión

Me parece una buena opcion a tener en cuenta si queremos dar un poco mas de seguridad a nuestro servidor, cabe destacar que para que funcione se debe tocar otras configuraciones que puede ser que lo toque en otro articulo, la implementación me parecio relativamente sencilla y la forma de ver los logs por igual.

En conclusion me parece una opcion interesante a probar. Puede ser que tambien haga otros articulos sobre honeypot.






