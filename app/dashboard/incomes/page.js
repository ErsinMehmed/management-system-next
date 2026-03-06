"use client";
import React, { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import Layout from "@/components/layout/Dashboard";
import Modal from "@/components/Modal";
import Table from "@/components/table/Table";
import Pagination from "@/components/table/Pagination";
import IncomeForm from "@/components/forms/Income";
import { useDisclosure } from "@heroui/react";
import { FiPlus } from "react-icons/fi";
import { commonStore, incomeStore, userStore } from "@/stores/useStore";

const DashboardIncomes = () => {
  const [incomeData, setIncomeData] = useState({
    distributor: "",
    amount: null,
    message: "",
  });

  const {
    allIncomes,
    perPage,
    isLoading,
    orderColumn,
    isIncomeCreated,
    createIncome,
    handlePageChange,
    handlePageClick,
    setPerPage,
    setOrderColumn,
    deleteIncome,
    loadAllIncomes,
  } = incomeStore;
  const { distributors, loadDistributors } = userStore;
  const { errorFields, successMessage, errorMessage } = commonStore;
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  useEffect(() => {
    loadAllIncomes();
    loadDistributors();
  }, []);

  const filteredAllIncomes = allIncomes?.items?.map(
    ({ _id, distributor, amount, message }) => ({
      _id,
      distributor: distributor?.name ?? "-",
      text: message,
      amount: amount + " €",
    })
  );

  const handleDeleteIncome = (id) => {
    deleteIncome(id);
  };

  const handleFieldChange = (name, value) => {
    if (name === "amount") {
      value = Number(value);
    }

    setIncomeData({ ...incomeData, [name]: value });
  };

  const handleCreateIncome = async () => {
    const response = await createIncome(incomeData);

    if (response) {
      setIncomeData({
        distributor: "",
        amount: null,
        message: "",
      });
    }

    return response;
  };

  const addButton = (
    <button
      type="button"
      className="text-white bg-[#0071f5] hover:bg-blue-600 focus:outline-none font-semibold rounded-full text-sm px-1.5 sm:px-4 2xl:px-6 py-1.5 2xl:py-2.5 text-center transition-all active:scale-90"
      onClick={onOpen}>
      <span className="hidden sm:block">Добави</span>
      <FiPlus className="w-5 h-5 sm:hidden" />
    </button>
  );

  return (
    <Layout title='Допълнителни Приходи'>
      <div className='min-h-screen 2xl:px-10'>
        <Table
          title='Приходи'
          data={filteredAllIncomes}
          columns={["дистрибутор", "съобщение", "сума"]}
          delete={handleDeleteIncome}
          perPage={perPage}
          orderColumn={orderColumn}
          showFilter={true}
          setOrderColumn={setOrderColumn}
          totalPages={allIncomes.pagination?.total_pages}
          isLoading={isLoading}
          setPerPage={setPerPage}
          searchBarButton={addButton}
          searchBarPlaceholder='дистрибутор'>
          <Pagination
            isLoading={isLoading}
            currentPage={allIncomes.pagination?.current_page}
            totalPages={allIncomes.pagination?.total_pages}
            totalItems={allIncomes.pagination?.total_results}
            perPage={allIncomes.pagination?.per_page}
            handlePrevPage={handlePageChange}
            handleNextPage={() => handlePageChange("next")}
            handlePageClick={(pageNumber) => {
              handlePageClick(pageNumber);
            }}
          />
        </Table>
      </div>

      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        title='Дoбави допълнителен приход'
        isLoading={isIncomeCreated}
        onSave={handleCreateIncome}>
        <IncomeForm
          data={incomeData}
          errorFields={errorFields}
          distributors={distributors}
          handleFieldChange={handleFieldChange}
        />
      </Modal>
    </Layout>
  );
};

export default observer(DashboardIncomes);
