import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './Onboarding.module.css'
import { CustomSelect } from '../../components/CustomSelect/CustomSelect'
import { ThemeSelector } from '../../components/ThemeSelector/ThemeSelector'
import { garmentTypes } from '../../constants/garmentTypes'

const stitchPatterns = [
  'Stockinette',
  'Ribbing',
  'Garter stitch',
  'Lace',
  'Cables',
  'Texture',
  'Not sure',
]

const defaultValues = {
  projectName: '',
  sessionNumber: '',
  garmentType: '',
  size: '',
  needleSize: '',
  gaugeStitches: '',
  gaugeRows: '',
  stitchPattern: ['Not sure'],
  anomalyAlertsEnabled: true,
}

function isFormEmpty(form: typeof defaultValues) {
  return (
    form.projectName === '' &&
    form.sessionNumber === '' &&
    form.garmentType === '' &&
    form.size === '' &&
    form.needleSize === '' &&
    form.gaugeStitches === '' &&
    form.gaugeRows === '' &&
    form.stitchPattern.length === 1 &&
    form.stitchPattern[0] === 'Not sure'
  )
}

function Onboarding() {
  const [form, setForm] = useState(defaultValues)
  const [showConfirm, setShowConfirm] = useState(false)
  const navigate = useNavigate()

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function handleStitchPatternChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { value, checked } = e.target
    setForm(prev => {
      if (checked) {
        // "Not sure" is a placeholder for "no answer yet", so it's mutually
        // exclusive with the real patterns in both directions.
        if (value === 'Not sure') {
          return { ...prev, stitchPattern: ['Not sure'] }
        }
        return { ...prev, stitchPattern: [...prev.stitchPattern.filter(p => p !== 'Not sure'), value] }
      }
      // Unchecking the last selection falls back to the "Not sure" default.
      const next = prev.stitchPattern.filter(p => p !== value)
      return { ...prev, stitchPattern: next.length === 0 ? ['Not sure'] : next }
    })
  }

  function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault()
    if (isFormEmpty(form)) {
      setShowConfirm(true)
      return
    }
    navigate('/counter', { state: form })
  }

  function handleSkip() {
    navigate('/counter', { state: defaultValues })
  }

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <div className={styles.heroInner}>
          <div>
            <p className={styles.wordmark}>Count Me In</p>
            <h1 className={styles.title}>Every<br />row<br /><em>counts.</em></h1>
            <p className={styles.subtitle}>
              Track your progress, catch missed rows, and knit with confidence.
            </p>
          </div>
          <div className={styles.heroBottom}>
            <div className={styles.statChip}>
              <span className={styles.dot} />
              <span>row timing &amp; averages</span>
            </div>
            <div className={styles.statChip}>
              <span className={styles.dot} />
              <span>missed row detection</span>
            </div>
            <div className={styles.statChip}>
              <span className={styles.dot} />
              <span>save your session summary</span>
            </div>
            <div className={styles.statChip}>
              <span className={styles.dot} />
              <span>six cozy themes</span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.formPanel}>
        <div className={styles.formInner}>
          <div className={styles.formHeaderRow}>
            <p className={styles.formHeading}>Your project</p>
            <ThemeSelector direction="down" />
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.row2}>
              <div className={styles.field}>
                <label htmlFor="projectName" className={styles.label}>Project name</label>
                <input
                  className={styles.input}
                  id="projectName"
                  name="projectName"
                  type="text"
                  placeholder="Moby Sweater"
                  value={form.projectName}
                  onChange={handleChange}
                />
              </div>
              <div className={styles.field}>
                <label htmlFor="sessionNumber" className={styles.label}>Session no.</label>
                <input
                  className={styles.input}
                  id="sessionNumber"
                  name="sessionNumber"
                  type="number"
                  placeholder="3"
                  min="1"
                  value={form.sessionNumber}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className={styles.row2}>
              <div className={styles.field}>
                <label htmlFor="garmentType" className={styles.label}>Project type</label>
                <CustomSelect
                  id="garmentType"
                  name="garmentType"
                  value={form.garmentType}
                  onChange={v => setForm(prev => ({ ...prev, garmentType: v }))}
                  options={garmentTypes.map(t => ({ value: t, label: t }))}
                  placeholder="select..."
                />
              </div>
              <div className={styles.field}>
                <label htmlFor="size" className={styles.label}>Size</label>
                <input
                  className={styles.input}
                  id="size"
                  name="size"
                  type="text"
                  placeholder="M"
                  value={form.size}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className={styles.row2}>
              <div className={styles.field}>
                <label htmlFor="needleSize" className={styles.label}>Needle size</label>
                <input
                  className={styles.input}
                  id="needleSize"
                  name="needleSize"
                  type="text"
                  placeholder="4 mm"
                  value={form.needleSize}
                  onChange={handleChange}
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Gauge</label>
                <div className={styles.gaugeRow}>
                  <input
                    className={`${styles.input} ${styles.gaugeInput}`}
                    name="gaugeStitches"
                    type="number"
                    min="0"
                    aria-label="gauge stitches"
                    value={form.gaugeStitches}
                    onChange={handleChange}
                  />
                  <span className={styles.gaugeUnit}>stitches</span>
                  <input
                    className={`${styles.input} ${styles.gaugeInput}`}
                    name="gaugeRows"
                    type="number"
                    min="0"
                    aria-label="gauge rows"
                    value={form.gaugeRows}
                    onChange={handleChange}
                  />
                  <span className={styles.gaugeUnit}>rows</span>
                </div>
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Stitch pattern</label>
              <div className={styles.pills}>
                {stitchPatterns.map(pattern => (
                  <label key={pattern} className={styles.pill}>
                    <input
                      type="checkbox"
                      value={pattern}
                      checked={form.stitchPattern.includes(pattern)}
                      onChange={handleStitchPatternChange}
                    />
                    {pattern}
                  </label>
                ))}
              </div>
            </div>

            <div className={styles.toggleRow}>
              <div className={styles.toggleInfo}>
                <span className={styles.toggleLabel}>Missed row alerts</span>
                <span className={styles.tooltipAnchor}>
                  ?
                  <span className={styles.tooltip}>
                    Tracks your average time/row to detect missed rows. Tip: when switching from a small section to a larger section (e.g. joining in the round) it's best to reset the average.
                  </span>
                </span>
              </div>
              <button
                type="button"
                className={`${styles.toggle} ${form.anomalyAlertsEnabled ? styles.toggleOn : ''}`}
                onClick={() => setForm({ ...form, anomalyAlertsEnabled: !form.anomalyAlertsEnabled })}
                aria-label="toggle missed row alerts"
              />
            </div>

            <div className={styles.divider} />

            <div className={styles.actions}>
              <button type="button" className={styles.skip} onClick={handleSkip}>
                Skip
              </button>
              <button type="submit" className={styles.submit}>
                Let's knit
              </button>
            </div>
          </form>
        </div>
      </div>

      {showConfirm && (
        <div className={styles.overlay}>
          <div className={styles.modal}>
            <p>You haven't filled in any details. Would you like to continue anyway?</p>
            <div className={styles.modalActions}>
              <button className={styles.skip} onClick={() => setShowConfirm(false)}>
                Back
              </button>
              <button className={styles.submit} onClick={() => navigate('/counter', { state: form })}>
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Onboarding
