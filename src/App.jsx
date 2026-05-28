import React, { useEffect, useMemo, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://zhivpkjrgobfwzvcclnb.supabase.co',
  'PUT_YOUR_PUBLISHABLE_KEY'
);

const teams = [
  'กฟน.1','กฟน.2','กฟน.3',
  'กฟฉ.1','กฟฉ.2','กฟฉ.3',
  'กฟก.1','กฟก.2','กฟก.3',
  'กฟต.1','กฟต.2','กฟต.3'
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
  {name:'นายอานนท์ รอตรักษา',role:'กรรมการและเลขาฯ'},

  {name:'โสภณ อินทโชติ',role:'ผู้ช่วยกรรมการ'},
  {name:'อิสริยะ เย็นทรวง',role:'ผู้ช่วยกรรมการ'}

];

const assistantJudges = [
  'โสภณ อินทโชติ',
  'อิสริยะ เย็นทรวง'
];

const adminUsers = [
  'นางนงลักษณ์ สุวรรณจำรัส'
];

const categories = [

  {
    key:'onsite',
    label:'คะแนนตรวจประเมิน ณ กฟฟ. หน้างาน',
    type:'main'
  },

  {
    key:'presentation',
    label:'คะแนนการนำเสนอผลงาน',
    type:'main'
  },

  {
    key:'theory',
    label:'คะแนนภาคทฤษฎี',
    type:'assistant'
  },

  {
    key:'fieldwork',
    label:'คะแนนแข่งภาคสนาม',
    type:'assistant'
  }

];

export default function App(){

  const [rows,setRows] = useState([]);
  const [preview,setPreview] = useState(false);

  const [user,setUser] = useState(judges[0].name);

  const [adminPass,setAdminPass] = useState('');
  const [adminLogged,setAdminLogged] = useState(false);

  const [f,setF] = useState({
    team:teams[0],
    category:'onsite',
    score:'',
    signed:false
  });

  const current = judges.find(j=>j.name===user);

  const filteredCategories = categories.filter(c => {

    if(assistantJudges.includes(user)){
      return c.type === 'assistant';
    }

    return c.type === 'main';

  });

  const isAdmin =
    adminUsers.includes(user) &&
    adminLogged;

  useEffect(()=>{
    loadScores();
  },[]);

  async function loadScores(){

    const { data } = await supabase
      .from('scores')
      .select('*')
      .order('id',{ascending:false});

    if(data){
      setRows(data);
    }

  }

  const exists = rows.some(
    r =>
      r.team===f.team &&
      r.judge===user &&
      r.category===f.category
  );

  async function add(){

    if(!f.signed || exists) return;

    const { error } = await supabase
      .from('scores')
      .insert([{
        team:f.team,
        judge:user,
        role:current.role,
        category:f.category,
        score:Number(f.score||0),
        created_at:new Date()
      }]);

    if(error){
      alert('เกิดข้อผิดพลาด');
      return;
    }

    setPreview(false);

    setF({
      team:teams[0],
      category:filteredCategories[0].key,
      score:'',
      signed:false
    });

    loadScores();

  }

  const myRows = rows.filter(
    r=>r.judge===user
  );

  const ranking = useMemo(()=>{

    return teams.map(team=>{

      const rs = rows.filter(r=>r.team===team);

      const total = rs.reduce(
        (a,b)=>a+Number(b.score||0),
        0
      );

      const avg = rs.length
        ? total / rs.length
        : 0;

      return {
        team,
        avg:+avg.toFixed(2),
        total:+total.toFixed(2),
        count:rs.length
      };

    }).sort((a,b)=>b.avg-a.avg);

  },[rows]);

  return (

    <div style={{
      minHeight:'100vh',
      background:'linear-gradient(135deg,#dbeafe,#f0f9ff,#ffffff)',
      padding:'24px',
      fontFamily:'sans-serif'
    }}>

      <div style={{
        maxWidth:'1400px',
        margin:'0 auto'
      }}>

        <div style={{
          background:'linear-gradient(90deg,#2563eb,#06b6d4)',
          padding:'35px',
          borderRadius:'28px',
          color:'#fff',
          marginBottom:'24px'
        }}>

          <div style={{
            fontSize:'38px',
            fontWeight:'bold'
          }}>
            🏆 ระบบลงคะแนนการแข่งขัน
          </div>

          <div style={{
            marginTop:'10px',
            fontSize:'20px'
          }}>
            การปฏิบัติการและบำรุงรักษาระบบไฟฟ้า
          </div>

        </div>

        <div style={{
          display:'grid',
          gridTemplateColumns:'1fr 2fr',
          gap:'20px'
        }}>

          <div style={cardStyle}>

            <h2 style={titleStyle}>
              👨‍⚖️ แบบฟอร์มลงคะแนน
            </h2>

            <div style={labelStyle}>
              เลือกกรรมการ
            </div>

            <select
              value={user}
              onChange={e=>{

                setUser(e.target.value);

                const isAssistant =
                  assistantJudges.includes(
                    e.target.value
                  );

                setF({
                  ...f,
                  category:isAssistant
                    ? 'theory'
                    : 'onsite'
                });

                setAdminLogged(false);

              }}
              style={inputStyle}
            >

              {judges.map(j=>(
                <option key={j.name}>
                  {j.name}
                </option>
              ))}

            </select>

            <div style={{
              marginTop:'12px',
              background:'#eff6ff',
              padding:'12px',
              borderRadius:'12px'
            }}>
              ตำแหน่ง: {current.role}
            </div>

            <div style={labelStyle}>
              ทีมแข่งขัน
            </div>

            <select
              value={f.team}
              onChange={e=>setF({
                ...f,
                team:e.target.value
              })}
              style={inputStyle}
            >

              {teams.map(t=>(
                <option key={t}>
                  {t}
                </option>
              ))}

            </select>

            <div style={labelStyle}>
              ประเภทคะแนน
            </div>

            <select
              value={f.category}
              onChange={e=>setF({
                ...f,
                category:e.target.value
              })}
              style={inputStyle}
            >

              {filteredCategories.map(c=>(

                <option
                  key={c.key}
                  value={c.key}
                >
                  {c.label}
                </option>

              ))}

            </select>

            <div style={labelStyle}>
              คะแนน (0 - 5)
            </div>

            <input
              type='number'
              min='0'
              max='5'
              step='0.1'
              value={f.score}
              onChange={e=>setF({
                ...f,
                score:e.target.value
              })}
              style={inputStyle}
            />

            <label style={{
              display:'flex',
              gap:'10px',
              marginTop:'18px'
            }}>

              <input
                type='checkbox'
                checked={f.signed}
                onChange={e=>setF({
                  ...f,
                  signed:e.target.checked
                })}
              />

              ยืนยันการตรวจสอบคะแนน

            </label>

            {exists && (

              <div style={{
                color:'red',
                marginTop:'12px'
              }}>
                ลงคะแนนประเภทนี้ให้ทีมนี้แล้ว
              </div>

            )}

            <button
              disabled={!f.signed || exists}
              onClick={()=>setPreview(true)}
              style={buttonStyle}
            >
              ✅ ตรวจสอบก่อนส่งคะแนน
            </button>

          </div>

          <div style={cardStyle}>

            <h2 style={titleStyle}>
              📋 คะแนนที่ฉันลงไว้
            </h2>

            <table style={{
              width:'100%',
              borderCollapse:'collapse'
            }}>

              <thead>

                <tr style={{
                  background:'#eff6ff'
                }}>

                  <th style={thStyle}>ทีม</th>
                  <th style={thStyle}>ประเภท</th>
                  <th style={thStyle}>คะแนน</th>

                </tr>

              </thead>

              <tbody>

                {myRows.map((r,i)=>(

                  <tr key={i}>

                    <td style={tdStyle}>
                      {r.team}
                    </td>

                    <td style={tdStyle}>
                      {
                        categories.find(
                          c=>c.key===r.category
                        )?.label
                      }
                    </td>

                    <td style={tdStyle}>
                      <b>{r.score}</b>
                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        </div>

        {adminUsers.includes(user) &&
         !adminLogged && (

          <div style={{
            marginTop:'24px',
            background:'#fff',
            padding:'24px',
            borderRadius:'24px'
          }}>

            <h2>
              🔐 เข้าสู่ระบบผู้มีสิทธิ์
            </h2>

            <input
              type='password'
              placeholder='รหัสผ่าน'
              value={adminPass}
              onChange={e=>
                setAdminPass(e.target.value)
              }
              style={inputStyle}
            />

            <button
              onClick={()=>{

                if(adminPass==='peawsc2026'){
                  setAdminLogged(true);
                }else{
                  alert('รหัสผ่านไม่ถูกต้อง');
                }

              }}
              style={{
                marginTop:'14px',
                padding:'12px 18px',
                border:'none',
                borderRadius:'12px',
                background:'#2563eb',
                color:'#fff'
              }}
            >
              Login
            </button>

          </div>

        )}

        {isAdmin && (

          <div style={{
            marginTop:'24px',
            background:'#fff',
            borderRadius:'24px',
            padding:'24px'
          }}>

            <h2 style={titleStyle}>
              🔒 ตารางคะแนนรวม
            </h2>

            <table style={{
              width:'100%',
              borderCollapse:'collapse'
            }}>

              <thead>

                <tr style={{
                  background:'#eff6ff'
                }}>

                  <th style={thStyle}>อันดับ</th>
                  <th style={thStyle}>ทีม</th>
                  <th style={thStyle}>คะแนนรวม</th>
                  <th style={thStyle}>คะแนนเฉลี่ย</th>

                </tr>

              </thead>

              <tbody>

                {ranking.map((r,i)=>(

                  <tr key={i}>

                    <td style={tdStyle}>
                      {i+1}
                    </td>

                    <td style={tdStyle}>
                      {r.team}
                    </td>

                    <td style={tdStyle}>
                      {r.total}
                    </td>

                    <td style={tdStyle}>
                      {r.avg}
                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </div>

      {preview && (

        <div style={{
          position:'fixed',
          inset:0,
          background:'rgba(0,0,0,0.5)',
          display:'flex',
          justifyContent:'center',
          alignItems:'center'
        }}>

          <div style={{
            background:'#fff',
            padding:'30px',
            borderRadius:'24px',
            width:'420px'
          }}>

            <h2>
              🔍 ตรวจสอบก่อนส่ง
            </h2>

            <div style={{
              marginTop:'20px',
              lineHeight:'2'
            }}>

              <div>
                <b>ทีม:</b> {f.team}
              </div>

              <div>
                <b>ประเภท:</b>{' '}
                {
                  categories.find(
                    c=>c.key===f.category
                  )?.label
                }
              </div>

              <div>
                <b>คะแนน:</b> {f.score}
              </div>

            </div>

            <div style={{
              display:'flex',
              gap:'10px',
              marginTop:'24px'
            }}>

              <button
                onClick={()=>setPreview(false)}
                style={{
                  flex:1,
                  padding:'14px',
                  border:'none',
                  borderRadius:'12px'
                }}
              >
                ย้อนกลับ
              </button>

              <button
                onClick={add}
                style={{
                  flex:1,
                  padding:'14px',
                  border:'none',
                  borderRadius:'12px',
                  background:'#2563eb',
                  color:'#fff'
                }}
              >
                ยืนยันส่งคะแนน
              </button>

            </div>

          </div>

        </div>

      )}

    </div>

  );

}

const cardStyle = {
  background:'#fff',
  borderRadius:'24px',
  padding:'24px',
  boxShadow:'0 10px 25px rgba(0,0,0,0.08)'
};

const titleStyle = {
  marginBottom:'20px',
  fontSize:'24px'
};

const labelStyle = {
  marginTop:'16px',
  marginBottom:'8px',
  fontWeight:'bold'
};

const inputStyle = {
  width:'100%',
  padding:'14px',
  borderRadius:'14px',
  border:'1px solid #cbd5e1',
  fontSize:'16px'
};

const buttonStyle = {
  width:'100%',
  marginTop:'24px',
  padding:'16px',
  border:'none',
  borderRadius:'18px',
  background:'linear-gradient(90deg,#2563eb,#06b6d4)',
  color:'#fff',
  fontWeight:'bold',
  fontSize:'18px'
};

const thStyle = {
  padding:'14px',
  borderBottom:'1px solid #e2e8f0'
};

const tdStyle = {
  padding:'14px',
  borderBottom:'1px solid #f1f5f9',
  textAlign:'center'
};
