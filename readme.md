
Like in https://github.com/hapijs/hapi/issues/3444 , 
I had expected that `options.auth.strategies` would allow me to authenticate with multiple strategies until
one succeeds, but it kept only using the first strategy in the array I specified.

This repo shows an example on how I worked around it.

Command | Expected status
-|-
`curl -H "X-Requested-With:abcde" localhost:3000/` | 200
`curl -H "X-Requested-With:XmlHttpRequest" localhost:3000/` | 200
`curl -H "X-Requested-With:abcde" localhost:3000/1` | 401
`curl -H "X-Requested-With:XmlHttpRequest" localhost:3000/1` | 200
`curl -H "X-Requested-With:abcde" localhost:3000/2` | 200
`curl -H "X-Requested-With:XmlHttpRequest" localhost:3000/2` | 200
`curl -H "X-Requested-With:abcde" localhost:3000/3` | 401
`curl -H "X-Requested-With:XmlHttpRequest" localhost:3000/3` | 401
`curl -H "X-Requested-With:abcde" localhost:3000/4` | 401
`curl -H "X-Requested-With:XmlHttpRequest" localhost:3000/4` | 401
`curl -H "X-Requested-With:abcde" localhost:3000/5` | 401
`curl -H "X-Requested-With:XmlHttpRequest" localhost:3000/5` | 200
`curl -H "X-Requested-With:abcde" localhost:3000/6` | 401
`curl -H "X-Requested-With:XmlHttpRequest" localhost:3000/6` | 200
`curl -H "X-Requested-With:abcde" localhost:3000/7` | 200
`curl -H "X-Requested-With:XmlHttpRequest" localhost:3000/7` | 200
