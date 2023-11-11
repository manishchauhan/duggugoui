/*The primary purpose of this class is to
1. create a new instance of websocket connection
2. create rooms and switch between them
3. create one two one chat
4. create invite based chat
*/

class ChatWebSocket
{
    constructor()
    {
        this.socket = null;
    }
    connect(url)
    {
        if(!url)
        {
            console.warn("url cannot be empty")
            return;
        }
        this.socket = new WebSocket(url);
    }
    error(callBack)
    {
        this.socket.addEventListener('error', (error) => {
            callBack(error)
        });
    }
   
    open(callBack)
    {
        newSocket.addEventListener(`open`, (event) => {
            callBack(event)
        });
    }
    close()
    {
        if(this.socket)
        {
            this.socket.close();
        }else
        {
            console.warn("no socket available");
        }
        
    }

}