@echo off
start iw4x.exe -dedicated +set net_port <port> +exec server_match.cfg +party_enable 0 +sv_maxclients 12 +map_rotate
