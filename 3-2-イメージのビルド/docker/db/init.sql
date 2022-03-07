create table event.mail
(
    sent_to char(32) not null,
    subject char(32) not null,
    body    char(64) not null,
    sent_at char(32) not null,
    result  char(1) not null
);
