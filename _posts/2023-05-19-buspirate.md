---
layout: post
title:  "Upgrade Buspirate"
date:   2023-08-19 02:20:29 +0200
last_modified_at: 2023-08-19 02:20:29 +0200
toc:  true
tags: [Hardware]
categories: Hardware
---


---

The Bus Pirate is an open-source hacker multi-tool that talks to electronic stuff. It's got a bunch of features an intrepid hacker might need to prototype their next project. This manual is an effort to link all available Bus Pirate information in one place.

-[Dangerous prototypes](http://dangerousprototypes.com/docs/Bus_Pirate)

## Requeriments 

* Tera Term
* Dupont wire
* Mini USB

## Upgrade

This upgrade was done on a Windows machine. First download [Tera Term](https://github.com/TeraTermProject/osdn-download/releases/tag/teraterm-5.0_beta1) Check the device manager to see what serial port the bus pirate is using when the tera term is ready:

![image](https://github.com/b3nj1-1/blog/assets/76759292/b52f4f92-2030-4c70-a3f5-b362466756c0)

Now this part is important because if you touch other pins you can break the bus pirate, so be careful in this part, connect the PGD and PGC with Dupont wire.

I used a key instead of a Dupont wire because I forgot it:

![IMG_1289](https://github.com/b3nj1-1/blog/assets/76759292/067277eb-7c46-420b-a76b-7969904ec603)

When the pins are connected run the following command:

```cmd
pirate-loader.exe --dev=COM? --hex=BPv3-bootloader-upgrade-v4xtov4.5.hex
```
The output expect is:

```cmd
Writing page 41 row 328, a400...OK
Writing page 41 row 329, a480...OK
Writing page 41 row 330, a500...OK
Writing page 41 row 331, a580...OK
Writing page 41 row 332, a600...OK
Writing page 41 row 333, a680...OK
Writing page 41 row 334, a700...OK
Writing page 41 row 335, a780...OK
Erasing page 42, a800...ERROR [50]

Error updating firmware :(
```

Now, open tera term and go to Setup --> Serial Port and set up the following configuration:

![image](https://github.com/b3nj1-1/blog/assets/76759292/62a79067-416b-4904-aacb-05ca26e664e1)

Double space to check if it works and do the same process, disconnect the bus pirate, connect PGD and PGC and run the following command:

```cmd
pirate-loader.exe --dev=COM5 --hex=busPirate-JTAG_SAFE_1.hex
```

Go to tera term and set the serial port:

![image](https://github.com/b3nj1-1/blog/assets/76759292/8f3d7b23-ba5c-491b-9c77-bf82094e1854)

(i + enter)

![image](https://github.com/b3nj1-1/blog/assets/76759292/d1e8bd5b-617f-4088-bfe3-3f319634ecbd)

## Test

To verify the bus pirate is working, run ~:

![image](https://github.com/b3nj1-1/blog/assets/76759292/7b1acb5c-9623-46fa-9e36-c3a7411b1843)

IMPORTANT: 

    Connect the following pins be careful because if you connect with other pins you break the bus pirate
    
![image](https://github.com/b3nj1-1/blog/assets/76759292/c4f192c6-a906-40bc-9130-2871cbd021a7)

IMPORTANT:

    if you want to update your bus pirate please follow the official documentation

[Documentation](http://dangerousprototypes.com/docs/Pirate-Loader_console_upgrade_application_(Linux,_Mac,_Windows))

<p align="center">
<img src="https://tenor.com/view/timone-lion-king-hula-dance-gif-5602013.gif" width="400" height="400" />
</p>
