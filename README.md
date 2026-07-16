# Fisheye100M
Oceanele, lacurile și râurile acoperă mai mult de două treimi din suprafața Pământului, dar rămân, în mare parte, necunoscute. Nu știm cu precizie câți pești trăiesc sub suprafața unui lac de munte, cum migrează ei odată cu schimbarea temperaturii apei, sau cum se adaptează la modificările din mediul lor. Motivul e simplu: a ajunge acolo jos este greu, scump și poate periculos.
Fisheye100M este rezolvă această problemă.


Fisheye100M este un submarin autonom capabil să coboare la 100 de metri adâncime, să urmărească și să filmeze fauna acvatică, și să revină singur la suprafață pentru reîncărcare fără niciun scafandru, fără intervenție umană.
Submarinul este compus din trei subsisteme principale: corpul presurizat, sistemul de balast și propulsia.
Corpul din aluminiu adăpostește electronica, bateriile și microcontrollerul. Etanș la 10 bar, tot ce este sensibil la apă rămâne în interior.
Adâncimea este controlată prin balast variabil. Patru cilindri PPR montați lateral conțin fiecare un piston acționat de un motor NEMA 17 printr-un sistem de reductie 6:1 și un șurub T8×8. Microcontrollerul citește adâncimea din senzorul de presiune externă și ajustează poziția pistoanelor printr-un algoritm pentru a menține submarinul la adâncimea dorită. Când pistonul se retrage, apa intră, submarinul coboară. Procesul invers îl ridică.
Propulsia este asigurată de două motoare 895 montate în zona uscată. Axele traversează peretele prin simering-uri de viton duble și rotesc elicele prin sistemele de reductie planetar 3:1. Direcția este controlată diferențial.
Senzorul GY-302 citește lumina ambiantă continuu. Sub un prag definit, microcontrollerul pornește la nevoie cele 6 LED-uri COB frontale. Camera înregistrează și detectează mișcarea faunei în câmpul vizual.
La suprafață, barca menține legătura radio prin LoRa. Primește telemetria și transmite comenzi. Când misiunea se încheie, submarinul urcă.

Corp și structură
1× țeavă aluminiu 6061, diametru 89mm, perete 3mm, lungime 66cm - corp principal
4× țevi PPR diametru 63mm exterior / diametru 42mm interior, lungime 66cm - module balast
2× piese conectoare imprimate 3D ASA, diametru 250mm - joncțiune între țevi și emisfere
2× emisfere ASA imprimate 3D, diametru 250mm, perete 15mm cu piloni interni, capetele submarinului
Geam acrilic 4mm - ferestre frontale pentru LED-uri și cameră, etanșate cu O-ring
Structură portantă din tije inox sudate
Presiune maximă: 10 bar (100m adancime)
Etanșare îmbinări: O-ringuri pe toate joncțiunile statice
Presetupe alamă nichel IP68 pentru senzori exteriori și corpuri propulsoare
Presetupe alamă nichel IP68 pentru traversările de cabluri prin capace

Sistem de balast
4× cilindri PPR diametru 63mm / diametru 42mm interior, lungime 60cm (25cm folositi pentru cursa pistonului)
4× NEMA 17, câte unul per cilindru
4× sistem de reductie planetar 6:1, modul 0.8mm, 20° unghi de presiune
4× șurub T8×8 P2, 300mm
4× piuliță alamă flanșată T8, fixată pe piston cu șuruburi M3
4× cuplaj flexibil 8mm-8mm, ieșire sistem de reductie la bara T8
Pistoane diametru 40mm, 60mm lungime, 2× O-ring 36×4mm per piston
2× DRV8825 - drivere stepper
Forță teoretica disponibilă la 100m: 2,120N, necesară: 1,385N, marjă 1.53×
Consum menținere: 0W - șurub auto-blocant

Propulsie
2× motor 895, 24V, 10,000 rpm 
2× sistem de reductie planetar 3:1
2× elice 85mm, pas 90mm, 4 pale, ASA imprimat 3D
Etanșare ax: 2× simering Viton si cavitate unsoare marină
2× BTS7960 - driver H-bridge per motor

Sistem de alimentare
Propulsie: 2P6S Molicel INR21700-P42A - 12 celule, Electronice: 21.6V
6P2S Molicel INR21700-P42A - 12 celule, 7.4V

Electronică și control
Computer principal: Raspberry Pi 5 4GB - procesare video, interfață web, coordonare sistem
Microcontroller auxiliar: Raspberry Pi Pico W
Cameră: Raspberry Pi Camera Module
ICM-20948 - IMU 9 axe (accelerometru, giroscop)
BME280 - presiune internă, temperatură, umiditate interior
DHT11 ×1 - temperatură și umiditate suplimentară interior
DHT11 ×2 - câte unul în modulele de balast față și spate
DS3231 - timp real
GY-302 (BH1750) - intensitate luminoasă frontală, control automat LED-uri
DS18B20 - temperatură externă apă, montat exterior
Senzor presiune externă - calcul adâncime în timp real
LED COB 10W  x6
GPS SIM808 - poziție la suprafață + GPRS
LoRa SX1278 433MHz - modul comunicare LoRa
DRV8825 ×2 - motoare stepper NEMA 17 balast
BTS7960 ×2 - motoare propulsie 895

Barcă însoțitoare  (concept)
Platformă autonomă de suprafață cu rol de stație de urmărire și reîncărcare pentru submarin.
Structură din țevi PVC flotante - ușoară, modulară, rezistentă la coroziune
Propulsie diferențială: 2× motoare DC cu elice
Energie: panou solar + baterii LiPo
Microcontroller: Raspberry Pi Pico W
Comunicație cu submarinul: LoRa SX1278 433MHz
GPS propriu pentru poziționare și urmărire traseu submarin
Sistem de andocare: contacte electrice etanșe pentru reîncărcare submarin la suprafață
Funcție principală: rămâne la suprafață deasupra submarinului, releu comunicație, reîncărcare autonomă
