# Municipalité des îles-de-la-Madeleine

## À installer sur l'ordinateur
 - Node.js : https://nodejs.org/en/download/prebuilt-installer
 - Visual Studio Code (Pour voir ou modifier le code source) : https://code.visualstudio.com/Download
 - NPM
      - Dans un invite de commande tapez :
       ```bash
         npm install -g npm
       ```
## À installer sur le cellulaire
https://expo.dev/go
Expo Go vous permettra de rouler l'application sur votre cellulaire personnel.

## Avant toute chose

1. Télécharger le code source de ce Github : https://github.com/ipaquetteMuniles/MobileMuniles
2. Ouvrez le dans visual studio
3. Partez le serveur

## Pour partir le serveur

### 1. Installer les dépendances

   ```bash
   npx expo install
   npm install --global eas-cli
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

Assurez vous d'être sur le mode "Expo Go". Vous pouvez changer de mode en cliquant sur la touche "S" du clavier.
![image](https://github.com/ipaquetteMuniles/MobileMuniles/assets/169171284/dd0df849-a933-426c-a1d8-708a792c530b)

4. Troisièmement, apprécier l'aplication qui roule sur un serveur que vous venez tout juste de créer

## Pour de l'aide sur les commandes
   ```bash
    npx expo --help
   ```   

## Contacter iohann au besoin
iohann.paquette.1@ens.etsmtl.ca

## Liens importants
- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
- https://expo.dev/tools
