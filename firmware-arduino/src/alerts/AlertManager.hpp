// AlertManager.hpp — Gestionează alertele sonore non-blocking
//
// Principiu: nu folosim delay() niciodată. Update() verifică millis() și
// avansează pattern-ul pas cu pas la fiecare apel din loop().