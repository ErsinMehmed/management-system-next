"use client";
import React, { useEffect, useState, useMemo } from "react";
import { MdAttachMoney } from "react-icons/md";
import { observer } from "mobx-react-lite";
import Layout from "@/components/layout/Dashboard";
import Modal from "@/components/Modal";
import Input from "@/components/html/Input";
import Table from "@/components/table/Table";
import Pagination from "@/components/table/Pagination";
import IncomeForm from "@/components/forms/Income";
import { productTitle } from "@/utils";
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

  useEffect(() => {
    loadAllIncomes();
    loadDistributors();
  }, []);

  const filteredAllIncomes = allIncomes?.items?.map(
    ({ _id, distributor, amount, message }) => ({
      _id,
      distributor: distributor?.name ?? "-",
      text: message,
      amount: amount + " лв.",
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

  const modal = (
    <Modal
      isButton={true}
      errorFields={errorFields}
      saveBtnAction={handleCreateIncome}
      isRecordCreated={isIncomeCreated}
      openBtnText='Добави'
      title='Дoбави допълнителен приход'>
      <IncomeForm
        data={incomeData}
        errorFields={errorFields}
        distributors={distributors}
        handleFieldChange={handleFieldChange}
      />
    </Modal>
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
          searchBarButton={modal}
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
    </Layout>
  );
};

export default observer(DashboardIncomes);
