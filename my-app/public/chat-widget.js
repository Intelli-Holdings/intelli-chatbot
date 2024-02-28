(
    () => {
        const styleTag = `
          <style>
              #chat-widget {
                  position: fixed;
                  bottom: 20px;
                  right: 20px;
                  display: grid;
                  z-index: 999999999 !important;
              }
              #chat-messages {
                  height: auto;
                  padding: 10px;
                  overflow-y: auto;
              }
              #btn-trigger-chat {
                  box-sizing: border-box;
                  margin-left: auto;
                  margin-top: auto;
                  display: inline-flex;
                  height: 3rem;
                  width: 3rem;
                  align-items: center;
                  justify-content: center;
                  border-radius: 9999px;
                  color: white;
                  cursor: pointer;
                  background-color: #6b7280;
                  border-style: none;
              }
              .h-7 {
                  height: 1.75rem;
              }
              .w-7 {
                  width: 1.75rem;
              }
              .rounded-lg {
                  border-radius: 0.5rem;
              }
              .shadow-xl {
                  --tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0
                  --tw-ring-shadow: 0 0 #0000;
                  --tw-shadow-colored: 0 0 #0000;
                  --tw-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1),
                      0 8px 10px -6px rgb(0 0 0 / 0.1);
                  --tw-shadow-colored: 0 20px 25px -5px var(--tw-shadow-color),
                      0 8px 10px -6px var(--tw-shadow-color);
                  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000),
                      var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
              }
              .ring-1 {
                  --tw-ring-color: rgb(17 24 39 / 0.05);
                  --tw-ring-shadow: 0 0 #0000;
                  --tw-ring-offset-color: #fff;
                  --tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0
                      var(--tw-ring-offset-width) var(--tw-ring-offset-color);
                  --tw-ring-shadow: var(--tw-ring-inset) 0 0 0
                      calc(1px + var(--tw-ring-offset-width)) var(--tw-ring-color);
                  box-shadow: var(--tw-ring-offset-shadow), var(--tw-ring-shadow),
                      var(--tw-shadow, 0 0 #0000);
              }
          </style>
      `;

        const components = {
            icon_close: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-7 h-7"><line x1="18" x2="6" y1="6" y2="18"></line><line x1="6" x2="18" y1="6" y2="18"></line></svg>`,
            icon_message: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-7 h-7"><path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"></path></svg>`,
        };

        function intChatInterface(_chatKey) {
            const chatWidget = document.createElement("div");
            chatWidget.id = "chat-widget";
            chatWidget.innerHTML = `
              <iframe id="chat-frame-widget" src="/chat" class="shadow-xl ring-1 rounded-lg" style="display: none; border: none; position: fixed; inset: auto 15px 75px auto; width: 400px; height: 540px; opacity: 1; color-scheme: none; background: white !important; margin: 0px; max-height: 100vh; max-width: 100vw; transform: translateY(0px); transition: none 0s ease 0s !important; visibility: visible; z-index: 999999999 !important;"></iframe>
              <button id="btn-trigger-chat" class="shadow-xl ring-1">${components.icon_message}</button>
              `;

            document.head.insertAdjacentHTML("beforeend", styleTag);
            document.body.appendChild(chatWidget);

            const btn = document.getElementById("btn-trigger-chat");
            const frameWidget = document.getElementById("chat-frame-widget");
            frameWidget.style.display = "none";
            btn.addEventListener("click", () => {
                if (btn.innerHTML === components.icon_message) {
                    btn.innerHTML = components.icon_close;
                    frameWidget.style.display = "block";
                } else {
                    btn.innerHTML = components.icon_message;
                    frameWidget.style.display = "none";
                }
            });
        }

        window.ChatWidget = {
            init: intChatInterface,
        };
    })();
  