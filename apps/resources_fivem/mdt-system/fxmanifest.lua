fx_version 'cerulean'
games { 'gta5' }

description 'MDT System for RolePlayIdentity - Framework Independent'
version '2.0.0'

shared_scripts {
    'config.lua',
    'shared/utils.lua'
}

client_scripts {
    'client/main.lua'
}

server_scripts {
    'server/main.lua'
}

ui_page 'ui/index.html'

files {
    'ui/index.html',
    'ui/index.css',
    'ui/index.js',
    'ui/nui-bridge.js'
}

exports {
    'openMDT',
    'closeMDT',
    'isMDTOpen',
    'MDTLog',
    'MDTNotify',
    'MDTGetPlayerData',
    'MDTValidateIdentifier',
    'MDTValidateReport',
    'MDTGenerateId',
    'MDTCacheSet',
    'MDTCacheGet',
    'MDTRateLimitCheck'
}

server_exports {
    'searchCitizen',
    'saveReport',
    'getReports'
} 