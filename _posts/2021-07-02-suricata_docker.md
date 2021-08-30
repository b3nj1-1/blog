---
layout: post
title:  "IDS Suricata"
date:   2021-07-2 6:20:00 +0200
last_modified_at: 2021-07-2 07:21:29 +0200
toc:  true
tags: [suricata, ids/ips, utilidades, docker, blueteam]
categories: Utilidades
---

{: .message}


## Introducción
Suricata es una herramienta escalable. Este monitor de seguridad hace uso de las funciones multi-hilo de manera que solo con ejecutarse en una instancia el monitor balanceará su carga entre todos los procesadores disponibles, evitando incluso alguno de ellos si así lo especificamos. Gracias a ello, esta herramienta es capaz de procesar un ancho de banda de hasta 10 gigabits por segundo sin que ello repercuta sobre el rendimiento.

Esta herramienta también es capaz de identificar los principales protocolos de red, siendo capaz de controlar en todo momento todo el tráfico que se genera en el sistema y controlando posibles amenazas de malware.

## Requisitos
* nginx
* suricata

## Instalación
Instalamos primero nginx en docker y exponemos el puerto:

```bash
docker pull nginx
```

Aqui vemos nuestra dirección ip y la aplicacion instalada:

![](/images_blog/img_suricata/Pastedimage20210626115536.png)
![Pastedimage20210626115536](https://user-images.githubusercontent.com/76759292/127757896-48f1a414-5512-468d-83d8-e5167a6adf86.png)


![](/images_blog/img_suricata/Pastedimage20210626115650.png)
![Pastedimage20210626115650](https://user-images.githubusercontent.com/76759292/127757901-529182f0-a6fd-4b62-928d-f160eeb7af82.png)

## Instalamos el suricata

Esto lo haremos si  queremos ejecutarlo de manera basica y rapida, con el            parámetro ```-i``` le especificamos la tarjeta de red del servidor.
(Para la parte de los log tambien podriamos agregar volumenes)

Agregar que le especificamos las [capabilities](https://man7.org/linux/man-pages/man7/capabilities.7.html)a utilizar para que pueda supervisar la interzar de red:

```bash
docker run --rm -it --net=host \
    --cap-add=net_admin --cap-add=sys_nice \
    jasonish/suricata:latest -i ens33
```

Pruebo si tengo conexión con el server desde mi maquina de atacante: 

![](/images_blog/img_suricata/Pastedimage20210626122657.png)
![Pastedimage20210626122657](https://user-images.githubusercontent.com/76759292/127757903-ac04aa33-c54c-4fbe-bab6-35f9dc03445e.png)

Valido que el servicio esta habilitado desde en el servidor:

![](/images_blog/img_suricata/Pastedimage20210626122805.png)
![Pastedimage20210626122805](https://user-images.githubusercontent.com/76759292/127757905-42a14499-6ea5-47ac-803e-1f3d2a847f00.png)

## Reglas
Antes de entrar a la prueba para ver que reglas tiene suricata primero debemos entra al contenedor con el siguiente comando:

```bash
docker exec -it ID /bin/bash
```

Vamos a la ruta donde estan las reglas:

```bash
cat /var/lib/suricata/rules/suricata.rules
```

Tiene 30198 reglas, creo que es muy poco:

![](/images_blog/img_suricata/Pastedimage20210626123558.png)
![Pastedimage20210626123558](https://user-images.githubusercontent.com/76759292/127757908-9fbff0ab-4f5c-4e9a-bc0f-0e17b0b5dc85.png)

## Ataque DOS

Aqui vemos las alertas que nos da el suricata ante un [Ataque de denegación de servicio](https://es.wikipedia.org/wiki/Ataque_de_denegaci%C3%B3n_de_servicio):

![](/images_blog/img_suricata/Pastedimage20210626124321.png)
![Pastedimage20210626124321](https://user-images.githubusercontent.com/76759292/127757912-143e05a5-5ced-4aeb-a441-d1005b1832e0.png)

![](/images_blog/img_suricata/Pastedimage20210626124411.png)
![Pastedimage20210626124411](https://user-images.githubusercontent.com/76759292/127757917-52977f83-3469-4b8e-ad94-4eaeec4d45be.png)


## Resultado

El resultado fue el esperado, el servicio se detuvo de manera incorrecta:

![](/images_blog/img_suricata/Pastedimage20210626124541.png)
![Pastedimage20210626124541](https://user-images.githubusercontent.com/76759292/127757926-3a3cb51d-761f-4196-bca4-383bd4263ce2.png)

![](/images_blog/img_suricata/Pastedimage20210626124606.png)
![Pastedimage20210626124606](https://user-images.githubusercontent.com/76759292/127757927-b2219ea8-39e3-4f15-911c-2aa2251ef558.png)

## Levantamos el servicio
Ahora se procede a primero detener el contenedor y luego volver a iniciarlo:

![](/images_blog/img_suricata/Pastedimage20210626125155.png)
![Pastedimage20210626125155](https://user-images.githubusercontent.com/76759292/127757931-acce329c-7a8f-451f-a899-5f0e1952af14.png)

![](/images_blog/img_suricata/Pastedimage20210626125217.png)
![Pastedimage20210626125217](https://user-images.githubusercontent.com/76759292/127757934-6378a1c0-6dd9-4d01-a6d1-44292e494101.png)

## Estadísticas
Aqui podemos ver mediante los logs una estadística del total de lo recibido:

![](/images_blog/img_suricata/Pastedimage20210626125327.png)
![Pastedimage20210626125327](https://user-images.githubusercontent.com/76759292/127757937-0329191c-917e-4714-a974-79aa82c74fbf.png)


## Mitigación
Mediante los logs podemos hacer algo interesante y es que por ejemplo si tenemos la dirección de donde se originaron los ataques podemos tomarla:

![](/images_blog/img_suricata/Pastedimage20210626125650.png)
![Pastedimage20210626125650](https://user-images.githubusercontent.com/76759292/127757947-d3ffd550-ca08-4a9b-bd34-931866594f04.png)

Aqui compruebo:

![](/images_blog/img_suricata/Pastedimage20210626125634.png)
![Pastedimage20210626125634](https://user-images.githubusercontent.com/76759292/127757949-4cf6baa1-ab6b-448e-9af9-83f9b9fa188e.png)

## Bloqueo 

*  Forma 1

Con [firewalld](https://firewalld.org/):

```bash
firewall-cmd -add-rich-rule='rule family=ipv4 source address=192.168.204.131 reject' --permanent
```

![](/images_blog/img_suricata/Pastedimage20210626130203.png)
![Pastedimage20210626130203](https://user-images.githubusercontent.com/76759292/127757955-1330a9c3-b3d2-4a5d-aa7d-b683cb0f02ac.png)

* Forma 2

Utilice la que me pareció más fácil, ustedes usan cual sea de las dos:

![](/images_blog/img_suricata/Pastedimage20210626130725.png)
![Pastedimage20210626130725](https://user-images.githubusercontent.com/76759292/127757960-4bf158ac-3ecd-4780-aa73-103715b6d7b4.png)

## Resultado del Bloqueo

![](/images_blog/img_suricata/Pastedimage20210626131133.png)
![Uploading Pastedimage20210626131133.png…]()

## Opinión sobre las reglas

Como  recomendación diria que la que tiene por defectos son muy buenas solo toca analizarla y editarlas un poco pero si quieren hacer sus reglas tambien pueden hacerlo, primero creamos un backup del archivo original y listo:

![](/images_blog/img_suricata/Pastedimage20210626131505.png)
![Pastedimage20210626131505](https://user-images.githubusercontent.com/76759292/127757966-9b479fd3-65a8-4352-8b03-198d1b1abc7c.png)

Aqui les dejo una lista de reglas:
* [suricata-rules](https://github.com/lrvy/suricata-rules/blob/master/suricata-ids.rules)

## Nmap
Hago un escaneo de nmap de esta manera porque es un entorno controlado:

![](/images_blog/img_suricata/Pastedimage20210626133036.png)
![Pastedimage20210626133036](https://user-images.githubusercontent.com/76759292/127757972-13af9085-166a-434f-a2d8-7b71e2d13645.png)

Lo que se refleja en el suricata (aunque esto se puede hacer bypass, creo que es una buena medida contra un atacante):

![](/images_blog/img_suricata/Pastedimage20210626133108.png)
![Pastedimage20210626133108](https://user-images.githubusercontent.com/76759292/127757971-1cc9cf15-0547-4eeb-b158-998bfda78018.png)

## Aplicaciones en conjunto
En esta parte podemos implementar el honeypot y el suricata en conjunto:

```bash
 docker run -d -p 22:2222 cowrie/cowrie
```

Verificación:

![](/images_blog/img_suricata/Pastedimage20210626133545.png)
![Pastedimage20210626133545](https://user-images.githubusercontent.com/76759292/127757975-58203751-0c12-45ab-98b0-b454bca3c50f.png)

Aqui vemos que aunque sea un honeypot suricata sigue haciendo su trabajo:

![](/images_blog/img_suricata/Pastedimage20210626133749.png)
![Uploading Pastedimage20210626133749.png…]()

## Opinión General

*Todo esto se hizo en entorno controlado*

Toca agregar que sería una excelente opción a tomar para un entorno en producción, en mi experiencia usándolo se le puede sacar más provecho que el que le saque aquí. Se pueden hacer script que ayuden con la parte del bloqueo.

También existen otras formas de implementación como por ejemplo en un servidor como tal y no en un contenedor.

Review PWNED!!!!!
