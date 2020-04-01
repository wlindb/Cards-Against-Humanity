# Kort förklaring av projekt
Vi vill implementera spelet cards against humanity som en mobil applikation. Väldigt likt detta: https://pyx-1.pretendyoure.xyz/zy/game.jsp fast för telefoner.
Avnändaren kommer kunna gå in i ett spel-rum med flera användare, spelarna får sedan kort som kan läggas ut på planen, när alla kort är lagda eller tiden gått ut får en spelar välja sitt favorit kort.  

# Projektspecifikation för betygskrav E

## Ert projekt implementerar ett grundläggande "percistance-layer", med cookies och SQLite
Då vi tänker ha användare tänker vi förmodligen ha en sequilize databas för användar data samt kort data sedan tänker vi använda cookies för användare ska kunna slippa att logga in.

## Ert projekt skall implementera "gate":ade endpoints, p.s.s. som ni gjorde i labb3 för t.ex. "/profil" sidan

Vi tänker förutom spel sidan så kommer vi ha en profil sida där användare kan ändra sin information, denna kommer på serversidan finns som en gate:ad endpoint medans på klientsidan så kommer den finnas i en navbar.

## Ni skall visa grundläggande kunskaper om Javascript, HTML och CSS

Vi tänker använda react native för klientsidan och node och express för serversidan.

## Ni skall visa grundläggande förståelse för relationen mellan klient och server

Detta kommer visas genom kommunikation på spelplanen och uppdatering av profilsidan.

## Ert projekt skall inte vara sårbart för SQL-injections

Då vi förmodligen kommer använda sequilize så kommer vi få detta på köpet, om inte kommer vi använda prepared statements.




# Projektspecifikation för betygskrav C

## Ert projekt skall implementera saltning & hashning av lösenord

Detta kommer vi implementera i samband med att en användare skapas eller uppdaterar sitt lösenord och kommer göras med node crypto tillägget.

## Ert projekt får inte vara sårbar för XSS attacker

På gabbes föreläsning rekommenderades node paketer helmet-csp vilket vi förmodligen kommer använda.


## Ert projekt skall implementera aktiv session invalidering. T.ex. user logout
Det kommer finnas en utloggningsknapp på profilsidan.


## Ert projekt skall servera en klienten som skall vara byggd som en SPA

Detta kommer lösas då vi anävnder react native



# Projektspecifikation för betygskrav A

## Ert projekt skall implementera SSL / HTTPS, med antingen "self-signed" certifikat som ni gjorde i labb 5x, eller med "ca-signed" certifikat (se "ngrok" tillsammans med "Let's Encrypt")

Vi kommer att använda self-signed certifikat precis som i labb 5.


## Ert projekt skall implementera passiv sessions invalidering. Både genom "timeoutdetection" samt genom "cookie theft detecting" (samma session får inte komunicera med servern från flera olika IP addresser)

* Om en spelare är innaktiv för länge kommer denne att skickas ut från spel rummet. 
* Om man loggar in från en annan maskin då loggas den andra maskinen ut 
* Eventuellt (i mån av tid) kommer vi försöka implementera en session för rummen också, var om skaparen för rummet lämnar/alla lämnar så invalideras/tas rummet bort.

## Ert projekt skall inte förlora applikationsdata efter en server omstart & elleren server krasch. Detta förväntas göras genom användning av de "persistent storage" metoder som lärts ut i kursen

Då vi tänker använda en databas så kommer alla användar data överleva både en restart och krasch.

## Ert projekt skall använd websockets på minst ett sätt, samt enbart där det är logiskt

Då vi tänker ha spelrum kommer vi att använda websockets för att synka spelet mellan avnändarna, tex om en spelare lägger ut ett kort kommer vi att visa detta för resterande spelare i rummet genom websockets.
