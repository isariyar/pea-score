import React, { useEffect, useMemo, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://zhivpkjrgobfwzvcclnb.supabase.co',
  'sb_publishable_KsiY5dGDvyqVcBfp8usNMw_HOLU_Mfr'
);

const teams = ['กฟน.1','กฟน.2','กฟน.3','กฟฉ.1','กฟฉ.2','กฟฉ.3','กฟก.1','กฟก.2','กฟก.3','กฟต.1','กฟต.2','กฟต.3'];

const scoreKeys = [
  'ด้านงานปรับปรุง/บำรุงรักษาระบบไฟฟ้า',
  'ด้านงานแก้ไฟฟ้าขัดข้อง',
  'ด้านงานตรวจสอบระบบไฟฟ้า',
  'ด้านงานตัดต้นไม้',
  'ด้านงานส่องกล้องความร้อน'
];

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

export default function App() {
  const [rows, setRows] = useState([]);
  const [user, setUser] = useState(judges[0].name);

  const [form, setForm] = useState({
    team: teams[0],
    signed: false,
    ...Object.fromEntries(scoreKeys.map(k => [k, '']))
  });

  const current = judges.find(j => j.name === user);

  const loadScores = async () => {
    const { data } = await supabase
      .from('scores')
      .select('*')
      .order('id', { ascending: false });

    if (data) setRows(data);
  };

  useEffect(() => {
    loadScores();
  }, []);

  const add = async () => {
    if (!form.signed) return;

    const total = scoreKeys.reduce((a, k) => a + Number(form[k] || 0), 0);

    const payload = {
      team: form.team,
      judge: user,
      role: current.role,
      total,
      time: new Date().toLocaleString('th-TH')
    };

    const { error } = await supabase.from('scores').insert([payload]);

    if (error) {
      alert(error.message);
      return;
    }

    await loadScores();

    setForm({
      team: teams[0],
      signed: false,
      ...Object.fromEntries(scoreKeys.map(k => [k, '']))
    });
  };

  const grouped = useMemo(() => {
    return teams.map(team => ({
      team,
      rows: rows.filter(r => r.team === team)
    })).filter(g => g.rows.length);
  }, [rows]);

  return (
    <div style={{padding:'20px',fontFamily:'sans-serif'}}>
      <h1>ระบบลงคะแนนการแข่งขัน</h1>

      <div style={{marginBottom:'20px'}}>
        <select value={user} onChange={e=>setUser(e.target.value)}>
          {judges.map(j=><option key={j.name}>{j.name}</option>)}
        </select>
        <span style={{marginLeft:'10px'}}>{current.role}</span>
      </div>

      <div style={{border:'1px solid #ccc',padding:'16px',borderRadius:'10px',marginBottom:'20px'}}>
        <select value={form.team} onChange={e=>setForm({...form,team:e.target.value})}>
          {teams.map(t=><option key={t}>{t}</option>)}
        </select>

        {scoreKeys.map(k=>(
          <div key={k} style={{marginTop:'10px'}}>
            <input
              type="number"
              placeholder={k}
              value={form[k]}
              onChange={e=>setForm({...form,[k]:e.target.value})}
              style={{width:'100%',padding:'8px'}}
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

        <button onClick={add} style={{marginTop:'10px',padding:'10px 20px'}}>
          บันทึก
        </button>
      </div>

      <h2>คะแนนทุกกรรมการ</h2>

      {grouped.map(group=>(
        <div key={group.team} style={{border:'1px solid #ddd',marginBottom:'20px',padding:'10px'}}>
          <h3>{group.team}</h3>

          <table width="100%" border="1" cellPadding="8" style={{borderCollapse:'collapse',textAlign:'center'}}>
            <thead>
              <tr>
                <th>กรรมการ</th>
                <th>รวมคะแนน</th>
                <th>เวลา</th>
              </tr>
            </thead>
            <tbody>
              {group.rows.map((r,i)=>(
                <tr key={i}>
                  <td>{r.judge}</td>
                  <td>{r.total}</td>
                  <td>{r.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}
