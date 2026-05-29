import React, { useEffect, useMemo, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://zhivpkjrgobfwzvcclnb.supabase.co',
  'sb_publishable_KsiY5dGDvyqVcBfp8usNMw_HOLU_Mfr'
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
  {name:'ทีมงาน กบร./ศฝฟ.',role:'ผู้ช่วยกรรมการ'},
];

const normalCategories = [
  {
    key:'onsite',
    label:'คะแนนตรวจประเมิน ณ กฟฟ. หน้างาน'
  },
  {
    key:'presentation',
    label:'คะแนนการนำเสนอผลงาน'
  }
];

const assistantCategories = [
  {
    key:'theory',
    label:'คะแนนภาคทฤษฎี'
  },
  {
    key:'fieldwork',
    label:'คะแนนแข่งภาคสนาม'
  }
];

const onsiteTopics = [
  {
    key:'maintenance',
    label:'1. Maintenance and Improvement'
  },
  {
    key:'outage',
    label:'2. Outage Maintenance'
  },
  {
    key:'patrol',
    label:'3. Patrol'
  },
  {
    key:'arboriculture',
    label:'4. Arboriculture'
  },
  {
    key:'thermal',
    label:'5. Thermal Viewer'
  }
];

export default function App(){

  const [rows,setRows] = useState([]);

  const [user,setUser] = useState(judges[0].name);

  const [adminPass,setAdminPass] = useState('');

  const [adminLogged,setAdminLogged] = useState(false);

  const current = judges.find(
    j=>j.name===user
  );

  const isAssistant =
    current.role === 'ผู้ช่วยกรรมการ';

  const categories = isAssistant
    ? assistantCategories
    : normalCategories;

  const [f,setF] = useState({

    team:teams[0],
    category:categories[0].key,

    score:'',

    maintenance:'',
    outage:'',
    patrol:'',
    arboriculture:'',
    thermal:'',

    presentation_check:'',
    presentation_analysis:'',
    presentation_qa:'',

    signed:false

  });

  useEffect(()=>{
    loadScores();
  },[]);

  useEffect(()=>{

    setF(prev=>({
      ...prev,
      category:categories[0].key
    }));

  },[user]);

  async function loadScores(){

    const { data,error } = await supabase
      .from('scores')
      .select('*')
      .order('id',{ascending:false});

    if(!error && data){
      setRows(data);
    }

  }

  const exists = rows.some(

    r =>

      r.team === f.team &&
      r.judge === user &&
      r.category === f.category

  );

  async function add(){

    if(!f.signed){
      return;
    }

    if(exists){
      alert('ลงคะแนนรายการนี้แล้ว');
      return;
    }

    const onsiteTotal =

      Number(f.maintenance || 0) +
      Number(f.outage || 0) +
      Number(f.patrol || 0) +
      Number(f.arboriculture || 0) +
      Number(f.thermal || 0);

    const presentationTotal =

      Number(f.presentation_check || 0) +
      Number(f.presentation_analysis || 0) +
      Number(f.presentation_qa || 0);

    let finalScore = 0;

    if(f.category === 'onsite'){

      finalScore = onsiteTotal;

    }else if(f.category === 'presentation'){

      finalScore = presentationTotal;

    }else{

      finalScore = Number(f.score || 0);

    }

    const payload = {

      team:f.team,
      judge:user,
      role:current.role,
      category:f.category,

      score:finalScore,

      maintenance:Number(f.maintenance || 0),
      outage:Number(f.outage || 0),
      patrol:Number(f.patrol || 0),
      arboriculture:Number(f.arboriculture || 0),
      thermal:Number(f.thermal || 0),

      presentation_check:Number(f.presentation_check || 0),
      presentation_analysis:Number(f.presentation_analysis || 0),
      presentation_qa:Number(f.presentation_qa || 0),

      created_at:new Date().toISOString()

    };

    const { error } = await supabase
      .from('scores')
      .insert([payload]);

    if(error){

      console.log(error);

      alert(error.message);

      return;
    }

    alert('บันทึกคะแนนสำเร็จ');

    setF({

      team:teams[0],
      category:categories[0].key,

      score:'',

      maintenance:'',
      outage:'',
      patrol:'',
      arboriculture:'',
      thermal:'',

      presentation_check:'',
      presentation_analysis:'',
      presentation_qa:'',

      signed:false

    });

    loadScores();

  }

  const myRows = rows.filter(
    r=>r.judge===user
  );

  const ranking = useMemo(()=>{

    return teams.map(team=>{

      const rs = rows.filter(
        r=>r.team===team
      );

      const total = rs.reduce(
        (a,b)=>a+Number(b.score || 0),
        0
      );

      const avg = rs.length
        ? total / rs.length
        : 0;

      return {
        team,
        total:+total.toFixed(2),
        avg:+avg.toFixed(2),
        count:rs.length
      };

    }).sort((a,b)=>b.total-a.total);

  },[rows]);

  return (

    <div style={{
      minHeight:'100vh',
      background:'linear-gradient(135deg,#0f172a,#1e3a8a,#0ea5e9)',
      padding:'30px',
      fontFamily:'sans-serif'
    }}>

      <div style={{
        maxWidth:'1500px',
        margin:'0 auto'
      }}>

        <div style={{
          background:'rgba(255,255,255,0.12)',
          backdropFilter:'blur(12px)',
          border:'1px solid rgba(255,255,255,0.15)',
          borderRadius:'30px',
          padding:'35px',
          color:'#fff',
          marginBottom:'25px',
          boxShadow:'0 15px 35px rgba(0,0,0,0.25)'
        }}>

          <div style={{
            fontSize:'42px',
            fontWeight:'bold'
          }}>
            🏆 PEAWSC SCORE SYSTEM
          </div>

          <div style={{
            marginTop:'10px',
            fontSize:'22px',
            opacity:0.95
          }}>
            ระบบลงคะแนนการแข่งขันการปฏิบัติการและบำรุงรักษาระบบไฟฟ้า
          </div>

        </div>

        <div style={{
          display:'grid',
          gridTemplateColumns:'1fr 1fr',
          gap:'25px'
        }}>

          <div style={cardStyle}>

            <div style={titleStyle}>
              👨‍⚖️ แบบฟอร์มลงคะแนน
            </div>

            <div style={labelStyle}>
              เลือกกรรมการ
            </div>

            <select
              value={user}
              onChange={e=>setUser(e.target.value)}
              style={inputStyle}
            >

              {judges.map(j=>(

                <option key={j.name}>
                  {j.name}
                </option>

              ))}

            </select>

            <div style={badgeStyle}>
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

              {categories.map(c=>(

                <option
                  key={c.key}
                  value={c.key}
                >
                  {c.label}
                </option>

              ))}

            </select>

            {f.category === 'onsite' ? (

              <>

                {onsiteTopics.map(topic=>(

                  <div key={topic.key}>

                    <div style={labelStyle}>
                      {topic.label} (0 - 12)
                    </div>

                    <input
                      type='number'
                      min='0'
                      max='12'
                      step='0.1'
                      value={f[topic.key]}
                      onChange={e=>{

                        let value = Number(e.target.value);

                        if(value > 12){
                          value = 12;
                        }

                        if(value < 0){
                          value = 0;
                        }

                        setF({
                          ...f,
                          [topic.key]:value
                        });

                      }}
                      style={inputStyle}
                    />

                  </div>

                ))}

                <div style={totalBoxStyle}>

                  รวมคะแนน:

                  {' '}

                  {

                    (
                      Number(f.maintenance || 0) +
                      Number(f.outage || 0) +
                      Number(f.patrol || 0) +
                      Number(f.arboriculture || 0) +
                      Number(f.thermal || 0)

                    ).toFixed(1)

                  }

                  / 60

                </div>

              </>

            ) : f.category === 'presentation' ? (

              <>

                <div style={labelStyle}>
                  1. ตรวจสอบสิ่งผิดปกติ (0 - 5)
                </div>

                <input
                  type='number'
                  min='0'
                  max='5'
                  step='0.1'
                  value={f.presentation_check}
                  onChange={e=>{

                    let value = Number(e.target.value);

                    if(value > 5){
                      value = 5;
                    }

                    if(value < 0){
                      value = 0;
                    }

                    setF({
                      ...f,
                      presentation_check:value
                    });

                  }}
                  style={inputStyle}
                />

                <div style={labelStyle}>
                  2. การวิเคราะห์และแก้ไข (0 - 5)
                </div>

                <input
                  type='number'
                  min='0'
                  max='5'
                  step='0.1'
                  value={f.presentation_analysis}
                  onChange={e=>{

                    let value = Number(e.target.value);

                    if(value > 5){
                      value = 5;
                    }

                    if(value < 0){
                      value = 0;
                    }

                    setF({
                      ...f,
                      presentation_analysis:value
                    });

                  }}
                  style={inputStyle}
                />

                <div style={labelStyle}>
                  3. ถาม-ตอบ (0 - 5)
                </div>

                <input
                  type='number'
                  min='0'
                  max='5'
                  step='0.1'
                  value={f.presentation_qa}
                  onChange={e=>{

                    let value = Number(e.target.value);

                    if(value > 5){
                      value = 5;
                    }

                    if(value < 0){
                      value = 0;
                    }

                    setF({
                      ...f,
                      presentation_qa:value
                    });

                  }}
                  style={inputStyle}
                />

                <div style={totalBoxStyle}>

                  รวมคะแนน:

                  {' '}

                  {

                    (
                      Number(f.presentation_check || 0) +
                      Number(f.presentation_analysis || 0) +
                      Number(f.presentation_qa || 0)

                    ).toFixed(1)

                  }

                  / 15

                </div>

              </>

            ) : (

              <>

                <div style={labelStyle}>
                  คะแนน
                </div>

                <input
                  type='number'
                  min='0'
                  max='100'
                  step='0.1'
                  value={f.score}
                  onChange={e=>setF({
                    ...f,
                    score:e.target.value
                  })}
                  style={inputStyle}
                />

              </>

            )}

            <label style={{
              display:'flex',
              alignItems:'center',
              gap:'10px',
              marginTop:'20px',
              fontWeight:'bold'
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
                marginTop:'15px',
                color:'#dc2626',
                fontWeight:'bold'
              }}>
                ⚠ ลงคะแนนรายการนี้แล้ว
              </div>

            )}

            <button
              disabled={!f.signed || exists}
              onClick={add}
              style={{
                ...buttonStyle,
                opacity:
                  (!f.signed || exists)
                  ? 0.5
                  : 1
              }}
            >
              ✅ ส่งคะแนน
            </button>

          </div>

          <div style={cardStyle}>

            <div style={titleStyle}>
              📋 คะแนนที่ฉันลงไว้
            </div>

            <div style={{
              overflow:'auto'
            }}>

              <table style={{
                width:'100%',
                borderCollapse:'collapse'
              }}>

                <thead>

                  <tr style={{
                    background:'#eff6ff'
                  }}>

                    <th style={thStyle}>
                      ทีม
                    </th>

                    <th style={thStyle}>
                      ประเภท
                    </th>

                    <th style={thStyle}>
                      คะแนน
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {myRows.map((r,i)=>(

                    <tr key={i}>

                      <td style={tdStyle}>
                        {r.team}
                      </td>

                      <td style={tdStyle}>
                        {r.category}
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

        </div>

        <div style={{
          ...cardStyle,
          marginTop:'25px'
        }}>

          <div style={titleStyle}>
            🔒 ตารางคะแนนรวม
          </div>

          {!adminLogged ? (

            <>

              <input
                type='password'
                placeholder='กรอกรหัสผ่าน'
                value={adminPass}
                onChange={e=>setAdminPass(
                  e.target.value
                )}
                style={inputStyle}
              />

              <button
                onClick={()=>{

                  if(adminPass === 'peawsc2026'){

                    setAdminLogged(true);

                  }else{

                    alert('รหัสผ่านไม่ถูกต้อง');

                  }

                }}
                style={buttonStyle}
              >
                Login
              </button>

            </>

          ) : (

            <div style={{
              overflow:'auto'
            }}>

              <table style={{
                width:'100%',
                borderCollapse:'collapse'
              }}>

                <thead>

                  <tr style={{
                    background:'#eff6ff'
                  }}>

                    <th style={thStyle}>
                      อันดับ
                    </th>

                    <th style={thStyle}>
                      ทีม
                    </th>

                    <th style={thStyle}>
                      คะแนนรวม
                    </th>

                    <th style={thStyle}>
                      คะแนนเฉลี่ย
                    </th>

                    <th style={thStyle}>
                      จำนวนคะแนน
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {ranking.map((r,i)=>(

                    <tr key={i}>

                      <td style={tdStyle}>
                        {i+1}
                      </td>

                      <td style={tdStyle}>
                        <b>{r.team}</b>
                      </td>

                      <td style={tdStyle}>
                        {r.total}
                      </td>

                      <td style={tdStyle}>
                        {r.avg}
                      </td>

                      <td style={tdStyle}>
                        {r.count}
                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          )}

        </div>

      </div>

    </div>

  );

}

const cardStyle = {
  background:'#ffffff',
  borderRadius:'28px',
  padding:'25px',
  boxShadow:'0 12px 30px rgba(0,0,0,0.12)'
};

const titleStyle = {
  marginBottom:'20px',
  fontSize:'28px',
  fontWeight:'bold',
  color:'#1e293b'
};

const labelStyle = {
  marginTop:'16px',
  marginBottom:'8px',
  fontWeight:'bold',
  color:'#334155'
};

const inputStyle = {
  width:'100%',
  padding:'14px',
  borderRadius:'16px',
  border:'1px solid #cbd5e1',
  fontSize:'16px',
  boxSizing:'border-box',
  outline:'none'
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
  fontSize:'18px',
  cursor:'pointer',
  boxShadow:'0 10px 20px rgba(37,99,235,0.25)'
};

const thStyle = {
  padding:'14px',
  borderBottom:'1px solid #e2e8f0',
  textAlign:'center',
  fontWeight:'bold'
};

const tdStyle = {
  padding:'14px',
  borderBottom:'1px solid #f1f5f9',
  textAlign:'center'
};

const totalBoxStyle = {
  marginTop:'20px',
  background:'#dbeafe',
  padding:'18px',
  borderRadius:'16px',
  fontWeight:'bold',
  fontSize:'22px',
  textAlign:'center',
  color:'#1e3a8a'
};

const badgeStyle = {
  marginTop:'12px',
  background:'#dbeafe',
  color:'#1e3a8a',
  padding:'12px',
  borderRadius:'14px',
  fontWeight:'bold'
};
