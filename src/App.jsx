import React, { useEffect, useMemo, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://zhivpkjrgobfwzvcclnb.supabase.co',
  'sb_publishable_KsiY5dGDvyqVcBfp8usNMw_HOLU_Mfr'
);

const teams = ['กฟน.1','กฟน.2','กฟน.3','กฟฉ.1','กฟฉ.2','กฟฉ.3','กฟก.1','กฟก.2','กฟก.3','กฟต.1','กฟต.2','กฟต.3'];

const scoreKeys = [
  'onsite',
  'theory',
  'fieldwork',
  'presentation'
];

const scoreLabels = {
  onsite:'คะแนนตรวจประเมิน ณ กฟฟ. หน้างาน',
  theory:'คะแนนภาคทฤษฎี',
  fieldwork:'คะแนนแข่งภาคสนาม',
  presentation:'คะแนนการนำเสนอผลงาน'
};

const judges = [
  {name:'นางนงลักษณ์ สุวรรณจำรัส',role:'ประธาน'},
  {name:'นายภักพงษ์ วงษ์พันธุ์ทา',role:'กรรมการ'},
  {name:'นายชิดชัย เพชรแก้วสุข',role:'กรรมการ'},
  {name:'นายวีระศักดิ์ กนกหงส์',role:'กรรมการ'},
  {name:'นายสุรเดช สุวรรณ',role:'กรรมการ'},
  {name:'นายยุทธนา ยิ้มประเสริฐ',role:'กรรมการ'},
  {name:'นายวชิรพล คำเพิ่ม',role:'กรรมการ'},
  {name:'นายดอน ฉาฉ่ำ',role:'กรรมการ'},
  {name:'นายกฤษฎา เทพศาสตรา',role:'กรรมการ'},
  {name:'นายภาสกร วิชชาบูรณ์ดำรง',role:'กรรมการ'},
  {name:'นางสาวปรายปวีย์ จันทร์วาสน์',role:'กรรมการ'},
  {name:'ว่าที่ร้อยตรี สันติ ไชยสีทา',role:'กรรมการ'},
  {name:'นายอานนท์ รอตรักษา',role:'กรรมการและเลขาฯ'}
];

export default function App(){
  const [rows,setRows]=useState([]);
  const [openTeams,setOpenTeams]=useState({});
  const [user,setUser]=useState(judges[0].name);

  const [form,setForm]=useState({
    team:teams[0],
    signed:false,
    maintenance:'',
    outage:'',
    inspection:'',
    treecut:'',
    thermal:''
  });

  const current=judges.find(j=>j.name===user);

  const loadScores = async()=>{
    const {data,error}=await supabase.from('scores').select('*').order('id',{ascending:false});
    if(!error && data) setRows(data);
  };

  useEffect(()=>{
    loadScores();
  },[]);

  const add=async()=>{
    if(!form.signed) return;

    const total = scoreKeys.reduce((a,k)=>a+Number(form[k]||0),0);

    const payload = {
      team:form.team,
      judge:user,
      role:current.role,
      maintenance:Number(form.maintenance||0),
      outage:Number(form.outage||0),
      inspection:Number(form.inspection||0),
      treecut:Number(form.treecut||0),
      thermal:Number(form.thermal||0),
      total,
      time:new Date().toLocaleString('th-TH')
    };

    const {error}=await supabase.from('scores').insert([payload]);

    if(error){
      alert(error.message);
      return;
    }

    await loadScores();

    setForm({
      team:teams[0],
      signed:false,
      maintenance:'',
      outage:'',
      inspection:'',
      treecut:'',
      thermal:''
    });
  };

  const groupedRows = teams.map(team=>({
    team,
    rows:rows.filter(r=>r.team===team)
  })).filter(g=>g.rows.length);

  const avg = useMemo(()=>{
    return teams.map(team=>{
      const rs = rows.filter(r=>r.team===team);

      const perCategory = scoreKeys.reduce((acc,k)=>{
        const value = rs.length
          ? +(rs.reduce((s,r)=>s+Number(r[k]||0),0)/rs.length).toFixed(2)
          : 0;

        return {...acc,[k]:value};
      },{});

      const score = scoreKeys.reduce((a,k)=>a+perCategory[k],0);

      return {
        team,
        perCategory,
        score:+score.toFixed(2),
        medal: score>=90?'ทอง':score>=80?'เงิน':score>=70?'ทองแดง':'-'
      };
    }).sort((a,b)=>b.score-a.score)
      .map((r,i)=>({...r,rank:i+1}));
  },[rows]);

  return (
    <div style={{padding:'20px',fontFamily:'sans-serif',background:'#f8fafc',minHeight:'100vh'}}>
      <div style={{maxWidth:'1400px',margin:'0 auto'}}>
        <h1>ระบบลงคะแนนการแข่งขัน</h1>

        <div style={{background:'#fff',padding:'15px',borderRadius:'12px',marginBottom:'20px'}}>
          <span>กรรมการ: </span>

          <select value={user} onChange={e=>setUser(e.target.value)}>
            {judges.map(j=><option key={j.name}>{j.name}</option>)}
          </select>

          <span style={{marginLeft:'10px'}}>{current.role}</span>
        </div>

        <div style={{display:'grid',gridTemplateColumns:'1fr 2fr',gap:'20px'}}>

          <div style={{background:'#fff',padding:'15px',borderRadius:'12px'}}>

            <select
              value={form.team}
              onChange={e=>setForm({...form,team:e.target.value})}
              style={{width:'100%',padding:'10px'}}
            >
              {teams.map(t=><option key={t}>{t}</option>)}
            </select>

            {scoreKeys.map(k=>(
              <div key={k} style={{marginTop:'10px'}}>
                <input
  type="number"
  min="0"
  max="5"
  step="0.1"
                  placeholder={scoreLabels[k]}
                  value={form[k]}
                  onChange={e=>setForm({...form,[k]:e.target.value})}
                  style={{width:'100%',padding:'10px'}}
                />
              </div>
            ))}

            <div style={{marginTop:'10px'}}>
              <label>
                <input
                  type="checkbox"
                  checked={form.signed}
                  onChange={e=>setForm({...form,signed:e.target.checked})}
                />
                เซ็นรับรองคะแนน
              </label>
            </div>

            <button
              onClick={add}
              style={{
                marginTop:'15px',
                width:'100%',
                padding:'12px',
                background:'#linear-gradient(90deg,#2563eb,#06b6d4)',
                color:'#fff',
                border:'none',
                borderRadius:'10px'
              }}
            >
              บันทึก
            </button>
          </div>

          <div style={{background:'#fff',padding:'15px',borderRadius:'12px',overflowX:'auto'}}>
            <h2>คะแนนทุกกรรมการ</h2>

            {groupedRows.map(group=>{

              const summary = scoreKeys.reduce((acc,k)=>{
                acc[k] = +(group.rows.reduce((s,r)=>s+Number(r[k]||0),0)/group.rows.length).toFixed(2);
                return acc;
              },{});

              const total = scoreKeys.reduce((a,k)=>a+summary[k],0).toFixed(2);

              return (
                <div key={group.team} style={{border:'1px solid #ddd',marginBottom:'15px',borderRadius:'10px'}}>

                  <button
                    onClick={()=>setOpenTeams(prev=>({...prev,[group.team]:!prev[group.team]}))}
                    style={{
                      width:'100%',
                      padding:'12px',
                      border:'none',
                      background:'#e2e8f0',
                      textAlign:'left',
                      fontWeight:'bold'
                    }}
                  >
                    {group.team} ({group.rows.length} คน)
                  </button>

                  {openTeams[group.team] && (
                    <div style={{padding:'10px',overflowX:'auto'}}>

                      <table width="100%" border="1" cellPadding="8"
                        style={{borderCollapse:'collapse',textAlign:'center'}}>

                        <thead style={{background:'#f1f5f9'}}>
                          <tr>
                            <th>กรรมการ</th>
                            {scoreKeys.map(k=><th key={k}>{scoreLabels[k]}</th>)}
                            <th>รวม</th>
                          </tr>
                        </thead>

                        <tbody>
                          {group.rows.map((r,i)=>(
                            <tr key={i}>
                              <td>{r.judge}</td>
                              {scoreKeys.map(k=><td key={k}>{r[k]}</td>)}
                              <td>{r.total}</td>
                            </tr>
                          ))}
                        </tbody>

                        <tfoot style={{background:'#fef9c3',fontWeight:'bold'}}>
                          <tr>
                            <td>เฉลี่ยทีม</td>
                            {scoreKeys.map(k=><td key={k}>{summary[k]}</td>)}
                            <td>{total}</td>
                          </tr>
                        </tfoot>

                      </table>

                    </div>
                  )}

                </div>
              );
            })}
          </div>
        </div>

        <div style={{background:'#fff',padding:'15px',borderRadius:'12px',marginTop:'20px',overflowX:'auto'}}>
          <h2>อันดับรวม</h2>

          <table width="100%" border="1" cellPadding="8"
            style={{borderCollapse:'collapse',textAlign:'center'}}>

            <thead style={{background:'#f1f5f9'}}>
              <tr>
                <th>อันดับ</th>
                <th>ทีม</th>
                {scoreKeys.map(k=><th key={k}>{scoreLabels[k]}</th>)}
                <th>รวม</th>
                <th>เหรียญ</th>
              </tr>
            </thead>

            <tbody>
              {avg.map((r,i)=>(
                <tr key={i}>
                  <td>{r.rank}</td>
                  <td>{r.team}</td>
                  {scoreKeys.map(k=><td key={k}>{r.perCategory[k]}</td>)}
                  <td>{r.score}</td>
                  <td>{r.medal}</td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>

      </div>
    </div>
  );
}
