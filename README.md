# Municipalité des îles-de-la-Madeleine

## À installer
Node.js : https://nodejs.org/en/download/prebuilt-installer
Visual Studio Code (Pour voir ou modifier le code source) : https://code.visualstudio.com/Download

## À installer sur le cellulaire
https://expo.dev/go
Expo Go vous permettra de rouler l'application sur votre cellulaire personnel.

## Pour partir le serveur

### 1. Installer les dépendances

   ```bash
   npm install
   ou encore
   yarn
   ```

### 2. Partir l'application dans un invite de commande
Avant toute chose veuillez vous assurez que vous êtes sur un WiFi qui n'a aucune restrictions (Muniles), pas (Muniles-Public)
1. Premièrement, vous devez ouvrir un invite de commande et partir le serveur
   -Windows et rechercher "invite de commande"

   ```bash
    npx expo start --tunnel --clear
   ```
#### Arguments pour bien partir le serveur
   - (--tunnel) Pour créer un tunnel entre le serveur et votre téléphone cellulaire, permet de rouler l'application sur un WiFi avec restriction
   - (--clear) Vide la cache du serveur et repart l'aplication à neuf
   - (--localhost) Roule le serveur sur une adresse ip locale
   - (--offline) Roule le serveur sans connexion

Tout autres informations sur les arguments possibles : https://docs.expo.dev/more/expo-cli/

2. Deuxièmement, scannez le code QR et ouvrez le lien
![image](https://github.com/ipaquetteMuniles/MobileMuniles/assets/169171284/d0996443-7bba-435c-a69f-648c8229a158)

3. Troisièmement, apprécier l'aplication qui roule sur un serveur que vous venez tout juste de créer

## Pour de l'aide sur les commandes
   ```bash
    npx expo --help
   ```   

## Contacter iohann au besoin
iohann.paquette.1@ens.etsmtl.ca

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
