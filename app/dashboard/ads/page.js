"use client";
import { observer } from "mobx-react-lite";
import Layout from "@/components/layout/Dashboard";
import Box from "@/components/ad/Box";
import Input from "@/components/html/Input";
import Select from "@/components/html/Select";
import Modal from "@/components/Modal";
import { commonStore, adStore } from "@/stores/useStore";
import { socialPlatforms } from "@/data";

const DashboardAds = () => {
  const { ads, adData, setAdData } = adStore;
  const { errorFields } = commonStore;

  const handleFieldChange = (name, value) => {
    setAdData({ ...adData, [name]: value });
  };

  console.log(adData);

  return (
    <Layout title='Реклами'>
      <Modal
        title='Добави изминала реклама'
        // saveBtnAction={() => {
        //
        // }}
        openButton={
          <button className='text-white absolute -top-[67px] right-2 bg-[#0071f5] hover:bg-blue-600 focus:outline-none font-semibold rounded-full text-sm px-5 py-1.5 text-center transition-all active:scale-90'>
            Добави
          </button>
        }>
        <div className='border-b pb-6'>
          <div className='text-slate-800 font-semibold mb-2'>Реклама</div>

          <div className='space-y-3.5'>
            <Select
              items={socialPlatforms}
              label='Избери социална мрежа'
              value={adData.platform || ""}
              onChange={(value) => handleFieldChange("platform", value)}
            />

            <Input
              type='text'
              label='Сума'
              value={adData.amount || ""}
              errorMessage={errorFields.amount}
              onChange={(value) => handleFieldChange("amount", value)}
            />

            <Input
              type='date'
              label='Дата'
              value={adData.date || ""}
              errorMessage={errorFields.date}
              onChange={(value) => handleFieldChange("date", value)}
            />
          </div>
        </div>
      </Modal>

      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5'>
        <Box />
        <Box />
        <Box />
      </div>
    </Layout>
  );
};

export default observer(DashboardAds);
