import { ButtonMobile } from '@alfalab/core-components/button/mobile';

import { Typography } from '@alfalab/core-components/typography';

import { AmountInput } from '@alfalab/core-components/amount-input';
import { Divider } from '@alfalab/core-components/divider';
import { Gap } from '@alfalab/core-components/gap';
import { Radio } from '@alfalab/core-components/radio';
import { SliderInput } from '@alfalab/core-components/slider-input';
import { BanknotesMIcon } from '@alfalab/icons-glyph/BanknotesMIcon';
import { CarMIcon } from '@alfalab/icons-glyph/CarMIcon';
import { LaptopPhoneMIcon } from '@alfalab/icons-glyph/LaptopPhoneMIcon';
import { RubOffMIcon } from '@alfalab/icons-glyph/RubOffMIcon';
import { ChangeEvent, useState } from 'react';
import { LS, LSKeys } from './ls';
import { appSt } from './style.css';
import { ThxLayout } from './thx/ThxLayout';
import { GaPayload, sendDataToGA } from './utils/events';

function calculateMonthlyPayment(annualRate: number, periodsPerYear: number, totalPeriods: number, loanAmount: number) {
  const monthlyRate = annualRate / periodsPerYear;

  return (monthlyRate * loanAmount) / (1 - Math.pow(1 + monthlyRate, -totalPeriods));
}

const swiperPaymentToGa: Record<string, GaPayload['chosen_option']> = {
  'Без залога': 'nothing',
  Авто: 'auto',
  Недвижимость: 'property',
};

export const App = () => {
  const [loading, setLoading] = useState(false);
  const [thx, setThx] = useState(LS.getItem(LSKeys.ShowThx, false));
  const [amount, setAmount] = useState(1_900_000);
  const [radioButton, setRadioButton] = useState('Без залога');
  const [step, setStep] = useState(0);

  const handleSumSliderChange = ({ value }: { value: number }) => {
    setAmount(value);
  };

  const handleSumInputChange = (_: ChangeEvent<HTMLInputElement>, { value }: { value: number | string }) => {
    setAmount(Number(value) / 100);
  };

  const formatPipsValue = (value: number) => `${value.toLocaleString('ru-RU')} ₽`;

  const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

  const submit = () => {
    setLoading(true);

    sendDataToGA({
      sum_cred: amount.toFixed(2),
      srok_kredita: 1,
      platezh_mes:
        radioButton === 'Без залога'
          ? calculateMonthlyPayment(0.339, 12, 12, amount).toFixed(2)
          : radioButton === 'Авто'
          ? calculateMonthlyPayment(0.27, 12, 12, amount).toFixed(2)
          : calculateMonthlyPayment(0.2807, 12, 12, amount).toFixed(2),
      chosen_option: swiperPaymentToGa[radioButton],
    }).then(() => {
      LS.setItem(LSKeys.ShowThx, true);
      setThx(true);
      setLoading(false);
    });
  };

  if (thx) {
    return <ThxLayout />;
  }

  return (
    <>
      {step === 0 && (
        <div className={appSt.container}>
          <Gap size={16} />

          <Typography.TitleResponsive font="system" tag="h3" view="medium" className={appSt.productsTitle}>
            Деньги на любые цели
          </Typography.TitleResponsive>

          <Gap size={32} />

          <Typography.Text tag="p" view="primary-medium" weight="bold">
            Желаемая сумма
          </Typography.Text>

          <SliderInput
            block={true}
            value={amount * 100}
            sliderValue={amount}
            onInputChange={handleSumInputChange}
            onSliderChange={handleSumSliderChange}
            onBlur={() => setAmount(prev => clamp(prev, 50_000, 1_900_000))}
            min={50_000}
            max={1_900_000}
            range={{ min: 50_000, max: 1_900_000 }}
            pips={{
              mode: 'values',
              values: [50_000, 1_900_000],
              format: { to: formatPipsValue },
            }}
            step={1}
            Input={AmountInput}
            labelView="outer"
            size={48}
          />

          <Gap size={16} />

          <Typography.Text tag="p" view="primary-medium" weight="bold">
            Выберите предложение
          </Typography.Text>

          <div className={appSt.card} onClick={() => setRadioButton('Без залога')}>
            <div className={appSt.topContainer}>
              <div className={appSt.textContainer}>
                <Typography.Text tag="p" view="primary-medium" style={{ marginBottom: 0 }}>
                  Без залога за 2 минуты
                </Typography.Text>
                <Gap size={4} />
                <Typography.Text tag="p" view="primary-large" weight="bold" style={{ marginBottom: 0 }}>
                  {calculateMonthlyPayment(0.339, 12, 12, amount).toLocaleString('ru-RU', {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  })}{' '}
                  ₽ в месяц
                </Typography.Text>
              </div>
              <Radio size={24} label="" disabled={false} checked={radioButton === 'Без залога'} block={false} />
            </div>
            <Gap size={12} />
            <div className={appSt.iconsContainer}>
              <div className={appSt.icon}>
                <LaptopPhoneMIcon width={16} height={16} color="#575757" />
                <Typography.Text tag="p" view="primary-small" style={{ marginBottom: 0, color: '#575757' }}>
                  оформление онлайн
                </Typography.Text>
              </div>
              <div className={appSt.icon}>
                <BanknotesMIcon width={16} height={16} color="#575757" />
                <Typography.Text tag="p" view="primary-small" style={{ marginBottom: 0, color: '#575757' }}>
                  деньги сразу
                </Typography.Text>
              </div>
            </div>
          </div>

          <Gap size={16} />

          <div className={appSt.card} onClick={() => setRadioButton('Авто')}>
            <div className={appSt.topContainer}>
              <div className={appSt.textContainer}>
                <Typography.Text tag="p" view="primary-medium" style={{ marginBottom: 0 }}>
                  Под залог автомобиля
                </Typography.Text>
                <Gap size={4} />
                <Typography.Text tag="p" view="primary-large" weight="bold" style={{ marginBottom: 0 }}>
                  {calculateMonthlyPayment(0.27, 12, 12, amount).toLocaleString('ru-RU', {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  })}{' '}
                  ₽ в месяц
                </Typography.Text>
              </div>
              <Radio size={24} label="" disabled={false} checked={radioButton === 'Авто'} block={false} />
            </div>
            <Gap size={12} />
            <div className={appSt.iconsContainer}>
              <div className={appSt.icon}>
                <CarMIcon width={16} height={16} color="#575757" />
                <Typography.Text tag="p" view="primary-small" style={{ marginBottom: 0, color: '#575757' }}>
                  можно без КАСКО
                </Typography.Text>
              </div>
              <div className={appSt.icon}>
                <RubOffMIcon width={16} height={16} color="#575757" />
                <Typography.Text tag="p" view="primary-small" style={{ marginBottom: 0, color: '#575757' }}>
                  снижение платежа
                </Typography.Text>
              </div>
            </div>
          </div>

          <Gap size={16} />

          <div className={appSt.card} onClick={() => setRadioButton('Недвижимость')}>
            <div className={appSt.topContainer}>
              <div className={appSt.textContainer}>
                <Typography.Text tag="p" view="primary-medium" style={{ marginBottom: 0 }}>
                  Под залог недвижимости
                </Typography.Text>
                <Gap size={4} />
                <Typography.Text tag="p" view="primary-large" weight="bold" style={{ marginBottom: 0 }}>
                  {calculateMonthlyPayment(0.2807, 12, 12, amount).toLocaleString('ru-RU', {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  })}{' '}
                  ₽ в месяц
                </Typography.Text>
              </div>
              <Radio size={24} label="" disabled={false} checked={radioButton === 'Недвижимость'} block={false} />
            </div>
            <Gap size={12} />
            <div className={appSt.iconsContainer}>
              <div className={appSt.icon}>
                <BanknotesMIcon width={16} height={16} color="#575757" />
                <Typography.Text tag="p" view="primary-small" style={{ marginBottom: 0, color: '#575757' }}>
                  деньги в день заявки
                </Typography.Text>
              </div>
            </div>
          </div>
        </div>
      )}

      {step === 1 && (
        <div className={appSt.container} style={{ paddingLeft: 0, paddingRight: 0, paddingTop: 0 }}>
          <div
            style={{
              backgroundColor: '#F3F4F5',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Gap size={32} />
            <Typography.Text
              tag="p"
              view="primary-medium"
              color="secondary"
              defaultMargins={false}
              style={{ textAlign: 'center' }}
            >
              Кредит наличными
            </Typography.Text>
            <Typography.TitleResponsive
              font="system"
              tag="h3"
              view="medium"
              className={appSt.productsTitle}
              style={{ textAlign: 'center' }}
            >
              На своих условиях
            </Typography.TitleResponsive>
            <Gap size={48} />
          </div>

          <div className={appSt.sumContainer}>
            <div className={appSt.sumCard}>
              <Typography.Text tag="p" view="primary-large" weight="bold" defaultMargins={false}>
                {amount.toLocaleString('ru-RU', {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })}{' '}
                ₽
              </Typography.Text>
              <Typography.Text tag="p" view="primary-small" color="secondary" defaultMargins={false}>
                Сумма кредита
              </Typography.Text>
            </div>
            <Divider className={appSt.divider} />
            <div className={appSt.sumCard} style={{ borderRadius: 0, marginTop: '-1px' }}>
              <Typography.Text tag="p" view="primary-large" weight="bold" defaultMargins={false}>
                На 1 год
              </Typography.Text>
              <Typography.Text tag="p" view="primary-small" color="secondary" defaultMargins={false}>
                Срок кредита
              </Typography.Text>
            </div>
            <Divider className={appSt.divider} />
            <div className={appSt.sumCard} style={{ borderRadius: 0, marginTop: '-1px' }}>
              {radioButton === 'Без залога' && (
                <Typography.Text tag="p" view="primary-large" weight="bold" defaultMargins={false}>
                  {calculateMonthlyPayment(0.339, 12, 12, amount).toLocaleString('ru-RU', {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  })}{' '}
                  ₽
                </Typography.Text>
              )}

              {radioButton === 'Авто' && (
                <Typography.Text tag="p" view="primary-large" weight="bold" defaultMargins={false}>
                  {calculateMonthlyPayment(0.27, 12, 12, amount).toLocaleString('ru-RU', {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  })}{' '}
                  ₽
                </Typography.Text>
              )}

              {radioButton === 'Недвижимость' && (
                <Typography.Text tag="p" view="primary-large" weight="bold" defaultMargins={false}>
                  {calculateMonthlyPayment(0.2807, 12, 12, amount).toLocaleString('ru-RU', {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  })}{' '}
                  ₽
                </Typography.Text>
              )}

              <Typography.Text tag="p" view="primary-small" color="secondary" defaultMargins={false}>
                Платёж в месяц
              </Typography.Text>
            </div>
            <Divider className={appSt.divider} />
            <div
              className={appSt.sumCard}
              style={{
                borderBottomLeftRadius: '1rem',
                borderBottomRightRadius: '1rem',
                borderTopLeftRadius: 0,
                borderTopRightRadius: 0,
                marginTop: '-1px',
              }}
            >
              <Typography.Text tag="p" view="primary-large" defaultMargins={false} weight={'bold'}>
                {radioButton}
              </Typography.Text>
              <Typography.Text tag="p" view="primary-small" color="secondary" defaultMargins={false}>
                Под залог
              </Typography.Text>
            </div>
          </div>
        </div>
      )}

      <Gap size={96} />

      {step === 0 && (
        <div className={appSt.bottomBtnThx}>
          <ButtonMobile loading={loading} onClick={() => setStep(1)} block view="primary">
            Перейти к предложению
          </ButtonMobile>
        </div>
      )}

      {step === 1 && (
        <div className={appSt.bottomBtnThx}>
          <ButtonMobile loading={loading} onClick={submit} block view="primary">
            Отправить заявку
          </ButtonMobile>
          <Gap size={8} />
          <ButtonMobile loading={loading} onClick={() => setStep(0)} block view="ghost" style={{ height: '56px' }}>
            Изменить условия
          </ButtonMobile>
        </div>
      )}
    </>
  );
};
