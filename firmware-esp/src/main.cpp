//Codul este un bridge între Arduino și un server Node.js.
//ESP32 citește JSON de pe UART, îl validează și îl trimite prin HTTP POST către un server din rețea, 
//reconectând automat WiFi dacă pică.