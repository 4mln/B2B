import os
os.environ['ENVIRONMENT'] = 'development'
try:
    from importlib import import_module
    m = import_module('app.main')
    app = getattr(m, 'app', None)
    if app is None:
        print('NO_APP_VARIABLE')
        raise SystemExit(1)
    from app.core.config import settings
    prefix = settings.API_PREFIX if hasattr(settings, 'API_PREFIX') else '/api/v1'
    routes = []
    for r in app.routes:
        p = getattr(r, 'path', None)
        methods = getattr(r, 'methods', None)
        name = getattr(r, 'name', None)
        if p is None:
            continue
        routes.append({'path':p,'methods':sorted(list(methods)) if methods else [],'name':name})
    api_routes = [r for r in routes if r['path'].startswith(prefix) or r['path'].startswith(prefix.rstrip('/')+'/')]
    print('API_PREFIX', prefix)
    print('TOTAL_ROUTES', len(routes))
    print('API_ROUTES', len(api_routes))
    for r in sorted(api_routes, key=lambda x: x['path']):
        print(r['path'], r['methods'], r['name'])
except Exception as e:
    print('IMPORT_ERROR', e)
    raise
