export class Utils {

    static _genkey(length) {
        let result = "";
        const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        for (let i = 0; i < length; i++) {
          result += characters.charAt(
            Math.floor(Math.random() * characters.length)
          );
        }
        return result;
      }

      static _createUsername(){
        return "user__"+Utils._genkey(3);
      }

}