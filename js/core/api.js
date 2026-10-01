async function apiFetch(path, options={}){
  const headers=Object.assign({'Content-Type':'application/json'}, options.headers||{});
  if(authToken) headers['Authorization']='Bearer '+authToken;
  const res=await fetch(API_BASE+path, Object.assign({}, options, {headers}));
  if(res.status===401){
    logout(true);
    throw new Error('Your session expired — please sign in again.');
  }
  if(!res.ok){
    let detail='Request failed';
    try{
      const data=await res.json();
      detail=data.detail || (data.errors&&data.errors[0]&&data.errors[0].msg) || detail;
    }catch(e){}
    throw new Error(detail);
  }
  if(res.status===204) return null;
  return res.json();
}
