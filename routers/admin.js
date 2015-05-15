
function registRouters(lighter, middleware, handler){
    
    lighter.get('/v1/admin/config',
        handler.v1.config.list
    );

    lighter.post('/v1/admin/config',
        handler.v1.config.post
    );

    lighter.put('/v1/admin/config',
        handler.v1.config.put
    );

    lighter.delete('/v1/admin/config',
        handler.v1.config.del
    );

}

module.exports = registRouters;