---
layout: post
title:  "Suricata"
date:  2021-07-2 6:20:00 +0200
last_modified_at: 2021-07-2 07:21:29 +0200
toc:  true
tags: [suricata, ids/ips, Utility, docker, blueteam]
categories: Utility
---


Suricata is a scalable tool. This security monitor makes use of multi-threading functions so that just by running in one instance the monitor will balance its load among all available processors, even bypassing some of them if we so specify. As a result, this tool is capable of processing a bandwidth of up to 10 gigabits per second with no impact on performance.

This tool is also capable of identifying the main network protocols, being able to control all the traffic generated in the system at all times and controlling possible malware threats.

--- 

## Requirements
* nginx
* suricata

## Installation
We first install nginx in docker and expose the port:

```bash
docker pull nginx
```

Here we see our ip address and the installed application:

![](/images_blog/img_suricata/Pastedimage20210626115536.png)
![Pastedimage20210626115536](https://user-images.githubusercontent.com/76759292/127757896-48f1a414-5512-468d-83d8-e5167a6adf86.png)


![](/images_blog/img_suricata/Pastedimage20210626115650.png)
![Pastedimage20210626115650](https://user-images.githubusercontent.com/76759292/127757901-529182f0-a6fd-4b62-928d-f160eeb7af82.png)

## Install suricata

This we will do if we want to execute it in a basic and fast way, with the parameter ```-i``` we specify the network card of the server.
(For the log part we could also add volumes).

Add that we specify the [capabilities](https://man7.org/linux/man-pages/man7/capabilities.7.html)to use so that you can monitor the network interface:

```bash
docker run --rm -it --net=host \
    --cap-add=net_admin --cap-add=sys_nice \
    jasonish/suricata:latest -i ens33
```

I test if I have connection to the server from my attacker machine: 

![](/images_blog/img_suricata/Pastedimage20210626122657.png)
![Pastedimage20210626122657](https://user-images.githubusercontent.com/76759292/127757903-ac04aa33-c54c-4fbe-bab6-35f9dc03445e.png)

Valid that the service is enabled on the server:

![](/images_blog/img_suricata/Pastedimage20210626122805.png)
![Pastedimage20210626122805](https://user-images.githubusercontent.com/76759292/127757905-42a14499-6ea5-47ac-803e-1f3d2a847f00.png)

## Rules
Before entering the test to see what rules suricata has we must first enter the container with the following command:

```bash
docker exec -it ID /bin/bash
```

Let's go to the route where the rules are:

```bash
cat /var/lib/suricata/rules/suricata.rules
```

It has 30198 rules, I think it is too few:

![](/images_blog/img_suricata/Pastedimage20210626123558.png)
![Pastedimage20210626123558](https://user-images.githubusercontent.com/76759292/127757908-9fbff0ab-4f5c-4e9a-bc0f-0e17b0b5dc85.png)

## Attack DOS

Here we see the alerts that the meerkat gives us in the event of a [attack](https://es.wikipedia.org/wiki/Ataque_de_denegaci%C3%B3n_de_servicio):

![](/images_blog/img_suricata/Pastedimage20210626124321.png)
![Pastedimage20210626124321](https://user-images.githubusercontent.com/76759292/127757912-143e05a5-5ced-4aeb-a441-d1005b1832e0.png)

![](/images_blog/img_suricata/Pastedimage20210626124411.png)
![Pastedimage20210626124411](https://user-images.githubusercontent.com/76759292/127757917-52977f83-3469-4b8e-ad94-4eaeec4d45be.png)


## Result

The result was as expected, the service was stopped incorrectly:

![](/images_blog/img_suricata/Pastedimage20210626124541.png)
![Pastedimage20210626124541](https://user-images.githubusercontent.com/76759292/127757926-3a3cb51d-761f-4196-bca4-383bd4263ce2.png)

![](/images_blog/img_suricata/Pastedimage20210626124606.png)
![Pastedimage20210626124606](https://user-images.githubusercontent.com/76759292/127757927-b2219ea8-39e3-4f15-911c-2aa2251ef558.png)

## Start service
Now we proceed to first stop the container and then restart it:

![](/images_blog/img_suricata/Pastedimage20210626125155.png)
![Pastedimage20210626125155](https://user-images.githubusercontent.com/76759292/127757931-acce329c-7a8f-451f-a899-5f0e1952af14.png)

![](/images_blog/img_suricata/Pastedimage20210626125217.png)
![Pastedimage20210626125217](https://user-images.githubusercontent.com/76759292/127757934-6378a1c0-6dd9-4d01-a6d1-44292e494101.png)

## Statistics
Here we can see through the logs a statistic of the total received:

![](/images_blog/img_suricata/Pastedimage20210626125327.png)
![Pastedimage20210626125327](https://user-images.githubusercontent.com/76759292/127757937-0329191c-917e-4714-a974-79aa82c74fbf.png)


## Mitigation
By means of the logs we can do something interesting and it is that for example if we have the address of where the attacks originated we can take it:

![](/images_blog/img_suricata/Pastedimage20210626125650.png)
![Pastedimage20210626125650](https://user-images.githubusercontent.com/76759292/127757947-d3ffd550-ca08-4a9b-bd34-931866594f04.png)

Here I check:

![](/images_blog/img_suricata/Pastedimage20210626125634.png)
![Pastedimage20210626125634](https://user-images.githubusercontent.com/76759292/127757949-4cf6baa1-ab6b-448e-9af9-83f9b9fa188e.png)

## Block 

*  Form 1

With [firewalld](https://firewalld.org/):

```bash
firewall-cmd -add-rich-rule='rule family=ipv4 source address=192.168.204.131 reject' --permanent
```

![](/images_blog/img_suricata/Pastedimage20210626130203.png)
![Pastedimage20210626130203](https://user-images.githubusercontent.com/76759292/127757955-1330a9c3-b3d2-4a5d-aa7d-b683cb0f02ac.png)

* Form 2

Use the one I found easiest, you use whichever of the two:

![](/images_blog/img_suricata/Pastedimage20210626130725.png)
![Pastedimage20210626130725](https://user-images.githubusercontent.com/76759292/127757960-4bf158ac-3ecd-4780-aa73-103715b6d7b4.png)

## Result

![](/images_blog/img_suricata/Pastedimage20210626131133.png)
![Uploading Pastedimage20210626131133.png…]()

## Opinion on the rules

As a recommendation I would say that the default ones are very good, you just have to analyze and edit them a little but if you want to make your own rules you can also do it, first create a backup of the original file and that's it:

![](/images_blog/img_suricata/Pastedimage20210626131505.png)
![Pastedimage20210626131505](https://user-images.githubusercontent.com/76759292/127757966-9b479fd3-65a8-4352-8b03-198d1b1abc7c.png)

Here is a list of rules:
* [suricata-rules](https://github.com/lrvy/suricata-rules/blob/master/suricata-ids.rules)

## Nmap
I do an nmap scan this way because it is a controlled environment:

![](/images_blog/img_suricata/Pastedimage20210626133036.png)
![Pastedimage20210626133036](https://user-images.githubusercontent.com/76759292/127757972-13af9085-166a-434f-a2d8-7b71e2d13645.png)

What is reflected in the meerkat (although this can be bypassed, I think it is a good measure against an attacker):

![](/images_blog/img_suricata/Pastedimage20210626133108.png)
![Pastedimage20210626133108](https://user-images.githubusercontent.com/76759292/127757971-1cc9cf15-0547-4eeb-b158-998bfda78018.png)

## Joint applications
In this part we can implement the honeypot and meerkat together:

```bash
 docker run -d -p 22:2222 cowrie/cowrie
```

Check:

![](/images_blog/img_suricata/Pastedimage20210626133545.png)
![Pastedimage20210626133545](https://user-images.githubusercontent.com/76759292/127757975-58203751-0c12-45ab-98b0-b454bca3c50f.png)

Here we see that even though it is a meerkat honeypot, it is still doing its job

![](/images_blog/img_suricata/Pastedimage20210626133749.png)


## General Opinion

*All this was done in a controlled environment.

It is worth adding that it would be an excellent option to take for a production environment, in my experience using it you can get more out of it than what you get here. It is possible to make scripts that help with the blocking part.

There are also other ways of implementation such as on a server as such and not in a container.

Review PWNED!!!!!


<p align="center">
<img src="https://tenor.com/view/timone-lion-king-hula-dance-gif-5602013.gif" width="400" height="400" />
</p>
