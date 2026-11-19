import { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import { apiRequest } from '../lib/api';
import { companyProfile, restaurantInfo } from '../data/content';

const emptyForm = {
  labelId: '',
  labelEn: '',
  taglineId: '',
  taglineEn: '',
  philosophyId: '',
  philosophyEn: '',
  feature1TitleId: '',
  feature1TitleEn: '',
  feature1DescId: '',
  feature1DescEn: '',
  feature2TitleId: '',
  feature2TitleEn: '',
  feature2DescId: '',
  feature2DescEn: '',
  feature3TitleId: '',
  feature3TitleEn: '',
  feature3DescId: '',
  feature3DescEn: '',
  feature4TitleId: '',
  feature4TitleEn: '',
  feature4DescId: '',
  feature4DescEn: '',
};

const emptyAbout = {
  sectionLabelId: 'Tentang Kami',
  sectionLabelEn: 'About Us',
  sectionTitleId: 'Filosofi di balik daun pisang.',
  sectionTitleEn: 'The philosophy behind the banana leaf.',
  welcomeMessageId: 'Wilujeung sumping, mangga linggih.',
  welcomeMessageEn: 'Welcome, please have a seat.',
  founded: companyProfile.founded,
  locationStory: companyProfile.locationStory,
  storyId: companyProfile.storyId.join('\n\n'),
  storyEn: companyProfile.storyEn.join('\n\n'),
  visionId: companyProfile.visionId,
  visionEn: companyProfile.visionEn,
  missionId: companyProfile.missionId.join('\n'),
  missionEn: companyProfile.missionEn.join('\n'),
  philosophyId: companyProfile.philosophyId.join('\n'),
  philosophyEn: companyProfile.philosophyEn.join('\n'),
  taglineId: restaurantInfo.taglineId,
  taglineEn: restaurantInfo.taglineEn,
  diningDescriptionId: 'Setiap meja dialasi daun pisang segar dan pramusaji berkeliling menyajikan nasi serta kuah sesuai porsi yang diinginkan pelanggan.',
  diningDescriptionEn: 'Every table is covered with fresh banana leaves while servers bring rice and gravy according to each guest’s preference.',
  milestonesId: companyProfile.milestones.join('\n'),
  milestonesEn: companyProfile.milestones.map((item) => item.replace('Rumah Makan Alas Daun resmi berdiri di Bandung.', 'Rumah Makan Alas Daun was founded in Bandung.')).join('\n'),
  signatureDishesId: companyProfile.signatureDishes.join('\n'),
  signatureDishesEn: companyProfile.signatureDishes.join('\n'),
  signatureBeveragesId: companyProfile.signatureBeverages.join('\n'),
  signatureBeveragesEn: companyProfile.signatureBeverages.join('\n'),
  capacityId: companyProfile.capacity,
  capacityEn: '260 seats',
  areasId: companyProfile.areas.join('\n'),
  areasEn: companyProfile.areas.join('\n'),
  facilitiesId: companyProfile.facilities.join('\n'),
  facilitiesEn: companyProfile.facilities.join('\n'),
  videoUrl: '/vidaboutus/alasdaun.mp4',
  youtubeUrl: `https://youtu.be/${restaurantInfo.youtubeVideoId}`,
};

function listToText(value) {
  return Array.isArray(value) ? value.join('\n') : '';
}

function textToList(value) {
  return value.split('\n').map((item) => item.trim()).filter(Boolean);
}

const featureDefaults = [
  {
    titleId: 'Makan Tanpa Piring',
    titleEn: 'No-Plate Dining',
    descId: 'Setiap meja dialasi daun pisang segar sebagai pengganti piring, menghadirkan pengalaman makan tradisional yang autentik dan akrab.',
    descEn: 'Dishes are served directly on a wide banana leaf on the table. No plates, only fragrant green leaves closing the distance between you and the food — a way of eating believed to enhance flavor and togetherness.',
  },
  {
    titleId: 'Nasi & Kuah Boleh Nambah',
    titleEn: 'Unlimited Rice & Gravy',
    descId: 'Pramusaji berkeliling menyajikan nasi serta kuah sesuai porsi yang diinginkan pelanggan, menghadirkan kebersamaan di setiap meja.',
    descEn: 'Servers move around the tables serving rice and gravy according to each guest’s preference, making every meal feel shared.',
  },
  {
    titleId: 'Cocok untuk Keluarga & Rombongan',
    titleEn: 'Great for Families & Groups',
    descId: 'Dengan kapasitas 260 kursi, tersedia area makan indoor, VIP Room, dan Meeting Room untuk keluarga maupun rombongan.',
    descEn: 'Long banana-leaf tables invite everyone to sit together. Ideal for family gatherings, office events, or groups of dozens.',
  },
  {
    titleId: 'Cita Rasa Nusantara',
    titleEn: 'Flavors of the Archipelago',
    descId: 'Nikmati hidangan tradisional Indonesia dengan bahan segar dan resep tradisional dalam suasana autentik.',
    descEn: 'Enjoy traditional Indonesian dishes made with fresh ingredients and traditional recipes in an authentic atmosphere.',
  },
];

export function SiteContentAdmin() {
  const [form, setForm] = useState(emptyForm);
  const [about, setAbout] = useState(emptyAbout);
  const [videoFile, setVideoFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const inputClass = 'mt-1 w-full rounded-lg border border-daun-200 bg-white px-3 py-2.5 text-sm text-daun-800 outline-none focus:border-daun-500 focus:ring-2 focus:ring-daun-100';

  useEffect(() => {
    apiRequest('/api/admin/content')
      .then(({ data }) => {
        setForm({
          labelId: data.uniquenessLabel?.id || 'KEUNIKAN ALAS DAUN',
          labelEn: data.uniquenessLabel?.en || 'WHAT MAKES US UNIQUE',
          taglineId: data.uniquenessTagline?.id || '',
          taglineEn: data.uniquenessTagline?.en || '',
          philosophyId: listToText(data.philosophy?.id),
          philosophyEn: listToText(data.philosophy?.en),
          feature1TitleId: data.uniquenessFeature1?.id?.title || featureDefaults[0].titleId,
          feature1TitleEn: data.uniquenessFeature1?.en?.title || featureDefaults[0].titleEn,
          feature1DescId: data.uniquenessFeature1?.id?.description || featureDefaults[0].descId,
          feature1DescEn: data.uniquenessFeature1?.en?.description || featureDefaults[0].descEn,
          feature2TitleId: data.uniquenessFeature2?.id?.title || featureDefaults[1].titleId,
          feature2TitleEn: data.uniquenessFeature2?.en?.title || featureDefaults[1].titleEn,
          feature2DescId: data.uniquenessFeature2?.id?.description || featureDefaults[1].descId,
          feature2DescEn: data.uniquenessFeature2?.en?.description || featureDefaults[1].descEn,
          feature3TitleId: data.uniquenessFeature3?.id?.title || featureDefaults[2].titleId,
          feature3TitleEn: data.uniquenessFeature3?.en?.title || featureDefaults[2].titleEn,
          feature3DescId: data.uniquenessFeature3?.id?.description || featureDefaults[2].descId,
          feature3DescEn: data.uniquenessFeature3?.en?.description || featureDefaults[2].descEn,
          feature4TitleId: data.uniquenessFeature4?.id?.title || featureDefaults[3].titleId,
          feature4TitleEn: data.uniquenessFeature4?.en?.title || featureDefaults[3].titleEn,
          feature4DescId: data.uniquenessFeature4?.id?.description || featureDefaults[3].descId,
          feature4DescEn: data.uniquenessFeature4?.en?.description || featureDefaults[3].descEn,
        });
        if (data.about) {
          setAbout({
            ...emptyAbout,
            sectionLabelId: data.about.id?.sectionLabel || emptyAbout.sectionLabelId,
            sectionLabelEn: data.about.en?.sectionLabel || emptyAbout.sectionLabelEn,
            sectionTitleId: data.about.id?.sectionTitle || emptyAbout.sectionTitleId,
            sectionTitleEn: data.about.en?.sectionTitle || emptyAbout.sectionTitleEn,
            welcomeMessageId: data.about.id?.welcomeMessage || emptyAbout.welcomeMessageId,
            welcomeMessageEn: data.about.en?.welcomeMessage || emptyAbout.welcomeMessageEn,
            founded: data.about.id?.founded || emptyAbout.founded,
            locationStory: data.about.id?.locationStory || emptyAbout.locationStory,
            storyId: listToText(data.about.id?.story).replace(/\n/g, '\n'),
            storyEn: listToText(data.about.en?.story).replace(/\n/g, '\n'),
            visionId: data.about.id?.vision || emptyAbout.visionId,
            visionEn: data.about.en?.vision || emptyAbout.visionEn,
            missionId: listToText(data.about.id?.mission),
            missionEn: listToText(data.about.en?.mission),
            philosophyId: listToText(data.about.id?.philosophy),
            philosophyEn: listToText(data.about.en?.philosophy),
            taglineId: data.about.id?.tagline || emptyAbout.taglineId,
            taglineEn: data.about.en?.tagline || emptyAbout.taglineEn,
            diningDescriptionId: data.about.id?.diningDescription || emptyAbout.diningDescriptionId,
            diningDescriptionEn: data.about.en?.diningDescription || emptyAbout.diningDescriptionEn,
            milestonesId: listToText(data.about.id?.milestones),
            milestonesEn: listToText(data.about.en?.milestones),
            signatureDishesId: listToText(data.about.id?.signatureDishes),
            signatureDishesEn: listToText(data.about.en?.signatureDishes),
            signatureBeveragesId: listToText(data.about.id?.signatureBeverages),
            signatureBeveragesEn: listToText(data.about.en?.signatureBeverages),
            capacityId: data.about.id?.capacity || emptyAbout.capacityId,
            capacityEn: data.about.en?.capacity || emptyAbout.capacityEn,
            areasId: listToText(data.about.id?.areas),
            areasEn: listToText(data.about.en?.areas),
            facilitiesId: listToText(data.about.id?.facilities),
            facilitiesEn: listToText(data.about.en?.facilities),
            videoUrl: data.about.id?.videoUrl || emptyAbout.videoUrl,
            youtubeUrl: data.about.id?.youtubeUrl || emptyAbout.youtubeUrl,
          });
        }
      })
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false));
  }, []);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function updateAboutField(event) {
    const { name, value } = event.target;
    setAbout((current) => ({ ...current, [name]: value }));
  }

  function handleVideoSelect(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!['video/mp4', 'video/webm', 'video/ogg'].includes(file.type)) {
      setError('Pilih video berformat MP4, WebM, atau OGG.');
      event.target.value = '';
      return;
    }
    if (file.size > 70 * 1024 * 1024) {
      setError('Ukuran video maksimal 70 MB.');
      event.target.value = '';
      return;
    }
    setError('');
    setVideoFile(file);
  }

  function readFileAsBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result;
        if (typeof result !== 'string' || !result.includes(',')) {
          reject(new Error('File video tidak dapat dibaca.'));
          return;
        }
        resolve(result.slice(result.indexOf(',') + 1));
      };
      reader.onerror = () => reject(new Error('File video tidak dapat dibaca.'));
      reader.readAsDataURL(file);
    });
  }

  async function handleSave(event) {
    event.preventDefault();
    setSaving(true);
    setError('');
    setNotice('');
    try {
      await apiRequest('/api/admin/content/uniquenessLabel', {
        method: 'PUT',
        body: { id: form.labelId, en: form.labelEn },
      });
      await apiRequest('/api/admin/content/uniquenessTagline', {
        method: 'PUT',
        body: { id: form.taglineId, en: form.taglineEn },
      });
      await apiRequest('/api/admin/content/philosophy', {
        method: 'PUT',
        body: {
          id: textToList(form.philosophyId),
          en: textToList(form.philosophyEn),
        },
      });
      for (let index = 1; index <= 4; index += 1) {
        await apiRequest(`/api/admin/content/uniquenessFeature${index}`, {
          method: 'PUT',
          body: {
            id: {
              title: form[`feature${index}TitleId`],
              description: form[`feature${index}DescId`],
            },
            en: {
              title: form[`feature${index}TitleEn`],
              description: form[`feature${index}DescEn`],
            },
          },
        });
      }
      let videoUrl = about.videoUrl;
      if (videoFile) {
        const uploaded = await apiRequest('/api/admin/content/about-video', {
          method: 'POST',
          body: { contentType: videoFile.type, data: await readFileAsBase64(videoFile) },
        });
        videoUrl = uploaded.data.videoUrl;
      }
      const toList = (field) => textToList(about[field]);
      await apiRequest('/api/admin/content/about', {
        method: 'PUT',
        body: {
          id: {
            sectionLabel: about.sectionLabelId, sectionTitle: about.sectionTitleId,
            welcomeMessage: about.welcomeMessageId,
            founded: about.founded, locationStory: about.locationStory,
            story: toList('storyId'), vision: about.visionId, mission: toList('missionId'),
            philosophy: toList('philosophyId'), tagline: about.taglineId,
            diningDescription: about.diningDescriptionId, milestones: toList('milestonesId'),
            signatureDishes: toList('signatureDishesId'), signatureBeverages: toList('signatureBeveragesId'),
            capacity: about.capacityId, areas: toList('areasId'), facilities: toList('facilitiesId'),
            videoUrl, youtubeUrl: about.youtubeUrl,
          },
          en: {
            sectionLabel: about.sectionLabelEn, sectionTitle: about.sectionTitleEn,
            welcomeMessage: about.welcomeMessageEn,
            founded: about.founded, locationStory: about.locationStory,
            story: toList('storyEn'), vision: about.visionEn, mission: toList('missionEn'),
            philosophy: toList('philosophyEn'), tagline: about.taglineEn,
            diningDescription: about.diningDescriptionEn, milestones: toList('milestonesEn'),
            signatureDishes: toList('signatureDishesEn'), signatureBeverages: toList('signatureBeveragesEn'),
            capacity: about.capacityEn, areas: toList('areasEn'), facilities: toList('facilitiesEn'),
            videoUrl, youtubeUrl: about.youtubeUrl,
          },
        },
      });
      setAbout((current) => ({ ...current, videoUrl }));
      setVideoFile(null);
      setNotice('Konten Tentang Kami berhasil disimpan.');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="py-12 text-center text-daun-600">Memuat konten situs...</p>;

  return (
    <div>
      <div className="mb-7">
        <h1 className="font-heading text-3xl font-bold text-daun-700">Konten Website</h1>
        <p className="mt-1 text-sm text-daun-600">Ubah tagline keunikan dan filosofi yang tampil di halaman utama.</p>
      </div>
      {error && <p role="alert" className="mb-5 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      {notice && <p role="status" className="mb-5 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-800">{notice}</p>}
      <form onSubmit={handleSave} className="space-y-6 rounded-2xl bg-white p-5 shadow-soft sm:p-7">
        <section>
          <h2 className="font-heading text-xl font-bold text-daun-700">Tagline Keunikan Alas Daun</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium text-daun-700">
              Label Bahasa Indonesia
              <input name="labelId" value={form.labelId} onChange={updateField} maxLength={500} required className={inputClass} />
            </label>
            <label className="text-sm font-medium text-daun-700">
              Label Bahasa Inggris
              <input name="labelEn" value={form.labelEn} onChange={updateField} maxLength={500} required className={inputClass} />
            </label>
            <label className="text-sm font-medium text-daun-700">
              Bahasa Indonesia
              <textarea name="taglineId" value={form.taglineId} onChange={updateField} maxLength={500} required rows="3" className={inputClass} />
            </label>
            <label className="text-sm font-medium text-daun-700">
              Bahasa Inggris
              <textarea name="taglineEn" value={form.taglineEn} onChange={updateField} maxLength={500} required rows="3" className={inputClass} />
            </label>
          </div>
        </section>
        <section>
          <h2 className="font-heading text-xl font-bold text-daun-700">Empat Kartu Keunikan</h2>
          <div className="mt-4 space-y-5">
            {[1, 2, 3, 4].map((index) => (
              <fieldset key={index} className="rounded-xl border border-daun-100 p-4">
                <legend className="px-2 text-sm font-bold text-daun-700">Kartu {index}</legend>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="text-sm font-medium text-daun-700">
                    Judul Bahasa Indonesia
                    <input name={`feature${index}TitleId`} value={form[`feature${index}TitleId`]} onChange={updateField} maxLength={120} required className={inputClass} />
                  </label>
                  <label className="text-sm font-medium text-daun-700">
                    Judul Bahasa Inggris
                    <input name={`feature${index}TitleEn`} value={form[`feature${index}TitleEn`]} onChange={updateField} maxLength={120} required className={inputClass} />
                  </label>
                  <label className="text-sm font-medium text-daun-700">
                    Deskripsi Bahasa Indonesia
                    <textarea name={`feature${index}DescId`} value={form[`feature${index}DescId`]} onChange={updateField} maxLength={1000} required rows="4" className={inputClass} />
                  </label>
                  <label className="text-sm font-medium text-daun-700">
                    Deskripsi Bahasa Inggris
                    <textarea name={`feature${index}DescEn`} value={form[`feature${index}DescEn`]} onChange={updateField} maxLength={1000} required rows="4" className={inputClass} />
                  </label>
                </div>
              </fieldset>
            ))}
          </div>
        </section>
        <section>
          <h2 className="font-heading text-xl font-bold text-daun-700">Filosofi Alas Daun</h2>
          <p className="mt-1 text-xs text-daun-500">Satu filosofi per baris.</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium text-daun-700">
              Bahasa Indonesia
              <textarea name="philosophyId" value={form.philosophyId} onChange={updateField} maxLength={3600} required rows="7" className={inputClass} />
            </label>
            <label className="text-sm font-medium text-daun-700">
              Bahasa Inggris
              <textarea name="philosophyEn" value={form.philosophyEn} onChange={updateField} maxLength={3600} required rows="7" className={inputClass} />
            </label>
          </div>
        </section>
        <button type="submit" disabled={saving} className="btn-primary disabled:cursor-not-allowed disabled:opacity-60">
          <Save size={18} />
          {saving ? 'Menyimpan...' : 'Simpan konten'}
        </button>
      </form>
      <form onSubmit={handleSave} className="mt-8 space-y-6 rounded-2xl bg-white p-5 shadow-soft sm:p-7">
        <div>
          <h2 className="font-heading text-xl font-bold text-daun-700">Tentang Kami</h2>
          <p className="mt-1 text-sm text-daun-600">Semua daftar ditulis satu item per baris. Cerita ditulis satu paragraf per baris.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-medium text-daun-700">Tanggal berdiri<input name="founded" value={about.founded} onChange={updateAboutField} maxLength={120} required className={inputClass} /></label>
          <label className="text-sm font-medium text-daun-700">Lokasi cerita<input name="locationStory" value={about.locationStory} onChange={updateAboutField} maxLength={120} required className={inputClass} /></label>
          {[
            ['sectionLabelId', 'Label bagian Bahasa Indonesia'], ['sectionLabelEn', 'Label bagian Bahasa Inggris'],
            ['sectionTitleId', 'Judul bagian Bahasa Indonesia'], ['sectionTitleEn', 'Judul bagian Bahasa Inggris'],
            ['welcomeMessageId', 'Pesan penutup Bahasa Indonesia'], ['welcomeMessageEn', 'Pesan penutup Bahasa Inggris'],
          ].map(([name, label]) => (
            <label key={name} className="text-sm font-medium text-daun-700">{label}<input name={name} value={about[name]} onChange={updateAboutField} maxLength={300} required className={inputClass} /></label>
          ))}
          {[
            ['storyId', 'Cerita Bahasa Indonesia', 8], ['storyEn', 'Cerita Bahasa Inggris', 8],
            ['visionId', 'Visi Bahasa Indonesia', 4], ['visionEn', 'Visi Bahasa Inggris', 4],
            ['missionId', 'Misi Bahasa Indonesia', 5], ['missionEn', 'Misi Bahasa Inggris', 5],
            ['taglineId', 'Tagline Bahasa Indonesia', 3], ['taglineEn', 'Tagline Bahasa Inggris', 3],
            ['diningDescriptionId', 'Deskripsi pengalaman Bahasa Indonesia', 4], ['diningDescriptionEn', 'Deskripsi pengalaman Bahasa Inggris', 4],
            ['milestonesId', 'Milestone Bahasa Indonesia', 6], ['milestonesEn', 'Milestone Bahasa Inggris', 6],
            ['signatureDishesId', 'Menu signature Bahasa Indonesia', 5], ['signatureDishesEn', 'Menu signature Bahasa Inggris', 5],
            ['signatureBeveragesId', 'Minuman signature Bahasa Indonesia', 5], ['signatureBeveragesEn', 'Minuman signature Bahasa Inggris', 5],
            ['capacityId', 'Kapasitas Bahasa Indonesia', 2], ['capacityEn', 'Kapasitas Bahasa Inggris', 2],
            ['areasId', 'Area Bahasa Indonesia', 4], ['areasEn', 'Area Bahasa Inggris', 4],
            ['facilitiesId', 'Fasilitas Bahasa Indonesia', 8], ['facilitiesEn', 'Fasilitas Bahasa Inggris', 8],
            ['philosophyId', 'Filosofi Bahasa Indonesia', 6], ['philosophyEn', 'Filosofi Bahasa Inggris', 6],
          ].map(([name, label, rows]) => (
            <label key={name} className="text-sm font-medium text-daun-700">
              {label}
              <textarea name={name} value={about[name]} onChange={updateAboutField} required rows={rows} className={inputClass} />
            </label>
          ))}
          <label className="text-sm font-medium text-daun-700">URL YouTube<input name="youtubeUrl" type="url" value={about.youtubeUrl} onChange={updateAboutField} maxLength={500} required className={inputClass} /></label>
          <label className="text-sm font-medium text-daun-700">Upload video (MP4/WebM/OGG, maksimal 70 MB)<input type="file" accept="video/mp4,video/webm,video/ogg" onChange={handleVideoSelect} className={`${inputClass} file:mr-3 file:rounded file:border-0 file:bg-daun-100 file:px-3 file:py-1.5`} /></label>
        </div>
        <p className="text-xs text-daun-500">Video saat ini: {about.videoUrl}</p>
        <button type="submit" disabled={saving} className="btn-primary disabled:cursor-not-allowed disabled:opacity-60"><Save size={18} />{saving ? 'Menyimpan...' : 'Simpan Tentang Kami'}</button>
      </form>
    </div>
  );
}
