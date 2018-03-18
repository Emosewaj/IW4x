@echo off
start iw4x.exe -dedicated +set net_port <port> +exec server.cfg +set playlistFilename "playlists_default.info" +playlist 0
