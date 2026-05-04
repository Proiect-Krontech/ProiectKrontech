// Un obiect HX711Driver = o singură celulă de sarcină.
// Avem 8 celule → 4 amplificatoare HX711 (2 celule/chip, canale A și B).
//
// Conexiuni fizice recomandate:
//   HX711 #0: DOUT=pin2, SCK=pin3  → celulele 0 și 1
//   HX711 #1: DOUT=pin4, SCK=pin5  → celulele 2 și 3
//   HX711 #2: DOUT=pin6, SCK=pin7  → celulele 4 și 5
//   HX711 #3: DOUT=pin8, SCK=pin9  → celulele 6 și 7
