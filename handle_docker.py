#!/usr/bin/env python

import threading
import os
import sys

sys.path.append(os.path.join(os.path.dirname(__file__), 'django'))
from git_hook.com_consts import COM_MSG_GIT_RESTART, COM_PORT  # noqa

git_restart_event = threading.Event()


def connection_handler(conn, address):
    saddr = "{}:{}".format(address[0], address[1])
    print("{}: Connected".format(saddr))
    buf = b''
    while True:
        buf_recv = conn.recv(4096)
        if len(buf_recv) == 0:
            print("{}: Disconnected".format(saddr))
            break

        # Handle data received
        buf += buf_recv

        # Find all msgs in received buffer
        while True:
            index = buf.find(b'\n')
            if index == -1:
                # Waiting for more data...
                break
            else:
                # Get actual message
                msg = buf[:index]
                # Strip message data from buf.
                buf = buf[index+1:]

                if msg == COM_MSG_GIT_RESTART:
                    # Restart
                    git_restart_event.set()
                    print("{}: Restart msg received, exiting".format(saddr))
                else:
                    print("{}: Unknown message received, ignoring: {}".format(saddr, buf))


def run_server():
    import socket

    print("Starting server on port {}".format(COM_PORT))
    serversocket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    serversocket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    serversocket.bind(('localhost', COM_PORT))
    serversocket.listen()

    while True:
        connection, address = serversocket.accept()

        t = threading.Thread(target=connection_handler, args=(connection, address), daemon=True)
        t.start()


def main():
    t = threading.Thread(target=run_server, daemon=True)
    t.start()

    # Wait for restart request
    git_restart_event.wait()

    # Restart request received: shutdown computer
    os.system("shutdown now -r")


if __name__ == '__main__':
    main()
