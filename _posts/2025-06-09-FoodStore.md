---
layout: post
title:  "Food Store From Mobile Hacking Lab"
date:   2025-06-09 07:41:29 +0200
last_modified_at: 2025-06-09 07:41:29 +0200
toc:  true
tags: [Android, SQLi]
categories: Android
---

This is a challenge that we have to analysis the code, and in the code we will found an SQLi that will led to a SQL injection. This is my own methodology and the way that I approach these challenges. The idea with this challenge is to convert our user into a Super User.

---

Before opening Jadx and starting to analyze the application, I found that the app only lets you register a regular user:

<img width="545" height="770" alt="image" src="https://github.com/user-attachments/assets/8d1b01a5-f427-42c2-8c88-b40df466a5ab" />

## Static Analysis

I started looking in the source code to see how the application is adding the input to the database. I used JADX to verify this:

<img width="975" height="521" alt="image" src="https://github.com/user-attachments/assets/9e33c68a-dfbc-4765-81a9-6b146076fab7" />

The way this app works stood out to me. The adduser function is responsible for inserting values into the database when a user signs up. Below is the line the app uses in the background to add a new user to the database:

String sql = "INSERT INTO users (username, password, address, isPro) VALUES ('" + Username + "', '" + encodedPassword + "', '" + encodedAddress + "', 0)";

As we can see, this specific line does not sanitize the input provided by the user, which leads to a SQL Injection (SQLi) vulnerability. Since user input is concatenated directly into the SQL query, an attacker could manipulate the query to access or modify unauthorized data.

Before attempting any injections, I examined the database using DB Browser for SQLite to understand how the data was being stored. This step helped me confirm the structure of the database and identify where user information was saved, which is important when testing for SQLi vulnerabilities.

<img width="975" height="756" alt="image" src="https://github.com/user-attachments/assets/df5ddbb4-6983-40ff-a906-fdd9e2c16d59" />

I first tried introducing the input in plaintext, but the app immediately crashed. This meant that when the app attempted to read the data, it caused an error and shut down. While this might seem like a failure, it was actually a good sign—it indicated that the SQL manipulation was successful, but the app couldn’t process the input because it wasn’t encoded.

My next idea was to escalate privileges by using the following query:

UPDATE users SET isPro = 1;

In this database, if isPro = 1, the user is treated as a Pro User. If isPro = 0, the user is considered a Regular User. Gaining Pro status would effectively give me additional access or features.

The issue, however, is that the vulnerable code only allows INSERT operations, since the query gets executed exactly as written inside the INSERT INTO statement. This means I can’t directly run an UPDATE unless I can break out of the original INSERT query.

At this point, I went back to analyze why plaintext input didn’t work in the first place. The answer was clear: I had completely bypassed the app’s logic. Normally, the app encodes the password and address fields in Base64 before inserting them into the database. Since my injected payload didn’t follow this rule, the application couldn’t process it correctly.

With this knowledge, my next approach was to insert the payload while making sure the password and address values were Base64-encoded. This way, I could stay consistent with the app’s expected logic while still attempting to inject SQL into the query.

<img width="900" height="634" alt="image" src="https://github.com/user-attachments/assets/29056c77-46d9-432c-9bc8-9465b68159c9" />

`z`', 'YQ==', 'Yg==', 1);--`

Finally, I got access as a ProUser:

<img width="665" height="1350" alt="image" src="https://github.com/user-attachments/assets/25f2e607-e3f0-43f1-b79c-57e7d7463865" />











