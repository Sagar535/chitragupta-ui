import { useState, useEffect } from 'react';
import {connect} from "react-redux";
import { useRouter } from 'next/router';
import Navbar from '../../../components/layout/Navbar';
import Modal from "../../../components/modal";
import SalarySettingForm from "../../../components/salarySettingForm";

import {fetchSalarySetting, remoteUpdateSalarySetting} from "../../../redux/actions/salarySettingActions";
import { setUpdateModal } from "../../../redux/actions/modalActions";
import {Btn} from "../../../components/formComponents";

const SalarySetting = ({user, salary_setting, updateModal, setUpdateModal, fetchSalarySetting, remoteUpdateSalarySetting}) => {
  const router = useRouter();
  const { id } = router.query;

  const [taxRules, setTaxRules] = useState([])
  const [salarySetting, setSalarySetting] = useState({})

  const updateTaxRules = (e) => {
    const index = taxRules.findIndex(
      (taxRule) => String(taxRule.id) === String(e.target.id) || String(taxRule.key) === String(e.target.id),
    )

    console.log(taxRules)
    console.log("INDEX ", index)
    console.log("target", e.target.id)

    const name_with_key = e.target.name
    const name_without_key = name_with_key.split('_').slice(0, -1).join('_')

    taxRules[index][name_with_key] = e.target.value
    taxRules[index][name_without_key] = e.target.value
    setTaxRules([...taxRules])
  }

  const removeTaxRule = (key) => {
    const index = taxRules.findIndex((taxRule) => taxRule.key === key)

    taxRules.splice(index, 1)
    setTaxRules([...taxRules])
  }

  const updateSalarySetting = (e) => {
    setSalarySetting({ ...salarySetting, [e.target.name]: e.target.value })
  }

  useEffect(() => {
    user && fetchSalarySetting(id);
  }, [user]);

  useEffect(() => {
    setSalarySetting(salary_setting)
    salary_setting.tax_rules && setTaxRules(salary_setting.tax_rules.map((tax_rule) => ({
        ...tax_rule,
        [`amount_from_${tax_rule.id}`] : tax_rule.amount_from,
        [`amount_to_${tax_rule.id}`] : tax_rule.amount_to,
        [`rate_${tax_rule.id}`]: tax_rule.rate
      })
    ))
  }, [salary_setting])

  return (
    <>
      <Navbar />
      <Btn className="bg-teal-500 hover:bg-teal-600 ml-4" onClick={() => setUpdateModal(true)}>
        EDIT
      </Btn>
      <div className="flex flex-col container max-w-md mt-10 mx-auto w-full items-center justify-center bg-white dark:bg-gray-800 rounded-lg shadow">
        <ul className="flex flex-col divide-y w-full">
          {[
            'ssf_office',
            'ssf_employee',
            'life_insurance_max',
            'ssf_tax_exemption_rate',
            'ssf_tax_exemption_max',
            'from_date',
            'to_date',
          ].map((field) => (
            <li className="flex flex-row uppercase h-20">
              <div className="my-auto ml-4 align-middle">
                {field.split('_').join(' ')}: {salarySetting[field]}
              </div>
            </li>
          ))}
        </ul>
      </div>
      {updateModal && (
        <Modal
          showModal={updateModal}
          setShowModal={setUpdateModal}
          title="Update Salary Setting"
        >
          <SalarySettingForm
            updateSalarySetting={updateSalarySetting}
            salarySetting={salarySetting}
            taxRules={taxRules}
            onSubmit={() => remoteUpdateSalarySetting(salarySetting, taxRules)}
            errors = {{}}
            setTaxRules={setTaxRules}
            updateTaxRules={updateTaxRules}
            removeTaxRule={removeTaxRule}
          />
        </Modal>
      )}
    </>
  );
}

const mapStateToProps = (state) => ({
  salary_setting: state.records.record,
  user: state.auth.user,
  updateModal: state.modal.updateModal
})

export default connect(mapStateToProps, { fetchSalarySetting, setUpdateModal, remoteUpdateSalarySetting })(SalarySetting)
