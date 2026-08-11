import { Accordion, Badge, Button, Col, Form, Row } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';

const PRICE_GROUPS = [
  ['sizes', 'Sizes', 'bx:ruler'],
  ['fabrics', 'Fabrics', 'bx:palette'],
  ['foams', 'Foams', 'bx:cube'],
  ['materials', 'Materials', 'bx:layer'],
];

const INPUT_TYPES = ['buttons', 'select', 'swatches', 'images'];

const blankOption = () => ({
  value: '',
  label: '',
  description: '',
  priceDelta: 0,
  priceOverride: '',
  swatch: { color: '', image: '' },
  isDefault: false,
  isActive: true,
});

const blankGroup = () => ({
  key: '',
  label: '',
  description: '',
  inputType: 'buttons',
  isRequired: true,
  displayOrder: 0,
  isActive: true,
  options: [blankOption()],
});

const updateAt = (items, index, updater) =>
  items.map((item, itemIndex) => (itemIndex === index ? updater(item) : item));

const OPTION_GRID_STYLE = {
  display: 'grid',
  gridTemplateColumns: 'minmax(180px,1.5fr) minmax(130px,1fr) minmax(120px,.8fr) minmax(120px,.8fr) 76px 84px 72px 40px',
  gap: 12,
  alignItems: 'end',
  minWidth: 920,
};

const EmptyLine = ({ children }) => (
  <div className="border rounded bg-light bg-opacity-50 text-muted fs-13 px-3 py-2">
    {children}
  </div>
);

const SectionHeader = ({ icon, title, count, action }) => (
  <div className="d-flex align-items-center justify-content-between gap-2 mb-3">
    <div className="d-flex align-items-center gap-2">
      <span className="avatar-xs rounded bg-primary bg-opacity-10 text-primary d-inline-flex align-items-center justify-content-center">
        <IconifyIcon icon={icon} className="fs-16" />
      </span>
      <span className="fw-semibold">{title}</span>
      <Badge bg="light" text="dark" className="border fw-normal">{count}</Badge>
    </div>
    {action}
  </div>
);

const OptionRow = ({ option, onChange, onDefault, onRemove }) => (
  <div className="border rounded px-3 py-2 mb-2">
    <div className="overflow-auto pb-1">
      <div style={OPTION_GRID_STYLE}>
      <div>
        <Form.Label className="small mb-1">Option</Form.Label>
        <Form.Control size="sm" placeholder="Queen" value={option.label || ''} onChange={(e) => onChange('label', e.target.value)} />
      </div>
      <div>
        <Form.Label className="small mb-1">Value</Form.Label>
        <Form.Control size="sm" placeholder="queen" value={option.value || ''} onChange={(e) => onChange('value', e.target.value)} />
      </div>
      <div>
        <Form.Label className="small mb-1">Extra Price</Form.Label>
        <Form.Control size="sm" type="number" min="0" value={option.priceDelta ?? 0} onChange={(e) => onChange('priceDelta', e.target.value)} />
      </div>
      <div>
        <Form.Label className="small mb-1">Fixed Price</Form.Label>
        <Form.Control size="sm" type="number" min="0" placeholder="optional" value={option.priceOverride ?? ''} onChange={(e) => onChange('priceOverride', e.target.value)} />
      </div>
      <div>
        <Form.Label className="small mb-1">Swatch</Form.Label>
        <Form.Control size="sm" type="color" value={option.swatch?.color || '#ffffff'} onChange={(e) => onChange('swatch.color', e.target.value)} />
      </div>
      <div className="d-flex flex-column align-items-center">
        <Form.Label className="small mb-1">Default</Form.Label>
        <Form.Check type="switch" label="" checked={Boolean(option.isDefault)} onChange={(e) => onDefault(e.target.checked)} />
      </div>
      <div className="d-flex flex-column align-items-center">
        <Form.Label className="small mb-1">Active</Form.Label>
        <Form.Check type="switch" label="" checked={option.isActive !== false} onChange={(e) => onChange('isActive', e.target.checked)} />
      </div>
      <div className="d-flex flex-column align-items-center">
        <Form.Label className="small mb-1 opacity-0">Delete</Form.Label>
        <Button type="button" size="sm" variant="soft-danger" onClick={onRemove} title="Remove option">
          <IconifyIcon icon="bx:trash" />
        </Button>
      </div>
      </div>
    </div>
    <Form.Control className="mt-2" size="sm" placeholder="Short description" value={option.description || ''} onChange={(e) => onChange('description', e.target.value)} />
  </div>
);

const ProductOptionsEditor = ({ optionPricing, setOptionPricing, customizationGroups, setCustomizationGroups }) => {
  const setPriceOption = (group, index, field, value) =>
    setOptionPricing((prev) => ({
      ...prev,
      [group]: updateAt(prev[group] || [], index, (option) =>
        field === 'swatch.color'
          ? { ...option, swatch: { ...(option.swatch || {}), color: value } }
          : { ...option, [field]: value }
      ),
    }));

  const setPriceDefault = (group, index, checked) =>
    setOptionPricing((prev) => ({
      ...prev,
      [group]: (prev[group] || []).map((option, optionIndex) => ({
        ...option,
        isDefault: checked && optionIndex === index,
      })),
    }));

  const setGroup = (groupIndex, field, value) =>
    setCustomizationGroups((prev) =>
      updateAt(prev, groupIndex, (group) => ({ ...group, [field]: value }))
    );

  const setGroupOption = (groupIndex, optionIndex, field, value) =>
    setCustomizationGroups((prev) =>
      updateAt(prev, groupIndex, (group) => ({
        ...group,
        options: updateAt(group.options || [], optionIndex, (option) =>
          field === 'swatch.color'
            ? { ...option, swatch: { ...(option.swatch || {}), color: value } }
            : { ...option, [field]: value }
        ),
      }))
    );

  const setGroupDefault = (groupIndex, optionIndex, checked) =>
    setCustomizationGroups((prev) =>
      updateAt(prev, groupIndex, (group) => ({
        ...group,
        options: (group.options || []).map((option, index) => ({
          ...option,
          isDefault: checked && index === optionIndex,
        })),
      }))
    );

  return (
    <>
      <Col md={12}>
        <hr className="my-3" />
        <h6 className="text-muted mb-3">Price Options</h6>
      </Col>

      {PRICE_GROUPS.map(([group, label, icon]) => {
        const options = optionPricing[group] || [];
        return (
          <Col md={12} key={group} className="mb-3">
            <div className="border rounded p-3">
              <SectionHeader
                icon={icon}
                title={label}
                count={options.length}
                action={(
                  <Button type="button" size="sm" variant="soft-primary" onClick={() => setOptionPricing((prev) => ({ ...prev, [group]: [...(prev[group] || []), blankOption()] }))}>
                    <IconifyIcon icon="bx:plus" className="me-1" />
                    Add
                  </Button>
                )}
              />
              {options.length === 0 ? (
                <EmptyLine>No price options</EmptyLine>
              ) : options.map((option, index) => (
                <OptionRow
                  key={option._id || index}
                  option={option}
                  onChange={(field, value) => setPriceOption(group, index, field, value)}
                  onDefault={(checked) => setPriceDefault(group, index, checked)}
                  onRemove={() => setOptionPricing((prev) => ({ ...prev, [group]: (prev[group] || []).filter((_, optionIndex) => optionIndex !== index) }))}
                />
              ))}
            </div>
          </Col>
        );
      })}

      <Col md={12}>
        <hr className="my-3" />
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h6 className="text-muted mb-0">Customization Groups</h6>
          <Button type="button" size="sm" variant="primary" onClick={() => setCustomizationGroups((prev) => [...prev, blankGroup()])}>
            <IconifyIcon icon="bx:plus" className="me-1" />
            Add Group
          </Button>
        </div>
      </Col>

      <Col md={12}>
        {customizationGroups.length === 0 ? (
          <EmptyLine>No customization groups</EmptyLine>
        ) : (
          <Accordion defaultActiveKey={['0']} alwaysOpen>
            {customizationGroups.map((group, groupIndex) => (
              <Accordion.Item eventKey={String(groupIndex)} key={group._id || groupIndex} className="border rounded mb-2 overflow-hidden">
                <Accordion.Header>
                  <div className="d-flex align-items-center gap-2 w-100 me-3">
                    <span className="fw-semibold">{group.label || group.key || 'New group'}</span>
                    <Badge bg="light" text="dark" className="border fw-normal">{(group.options || []).length}</Badge>
                    {group.isRequired !== false && <Badge bg="primary" className="fw-normal">Required</Badge>}
                    {group.isActive === false && <Badge bg="secondary" className="fw-normal">Inactive</Badge>}
                  </div>
                </Accordion.Header>
                <Accordion.Body>
                  <Row className="g-2 align-items-end mb-3">
                    <Col lg={2} md={6}>
                      <Form.Label className="small mb-1">Key</Form.Label>
                      <Form.Control size="sm" placeholder="fabric" value={group.key || ''} onChange={(e) => setGroup(groupIndex, 'key', e.target.value)} />
                    </Col>
                    <Col lg={3} md={6}>
                      <Form.Label className="small mb-1">Label</Form.Label>
                      <Form.Control size="sm" placeholder="Fabric" value={group.label || ''} onChange={(e) => setGroup(groupIndex, 'label', e.target.value)} />
                    </Col>
                    <Col lg={2} md={6}>
                      <Form.Label className="small mb-1">Input</Form.Label>
                      <Form.Select size="sm" value={group.inputType || 'buttons'} onChange={(e) => setGroup(groupIndex, 'inputType', e.target.value)}>
                        {INPUT_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
                      </Form.Select>
                    </Col>
                    <Col lg={2} md={6}>
                      <Form.Label className="small mb-1">Order</Form.Label>
                      <Form.Control size="sm" type="number" min="0" value={group.displayOrder ?? 0} onChange={(e) => setGroup(groupIndex, 'displayOrder', e.target.value)} />
                    </Col>
                    <Col lg={3}>
                      <div className="d-flex align-items-center justify-content-lg-end gap-2">
                        <Form.Check type="checkbox" label="Required" checked={group.isRequired !== false} onChange={(e) => setGroup(groupIndex, 'isRequired', e.target.checked)} />
                        <Form.Check type="checkbox" label="Active" checked={group.isActive !== false} onChange={(e) => setGroup(groupIndex, 'isActive', e.target.checked)} />
                        <Button type="button" size="sm" variant="soft-danger" onClick={() => setCustomizationGroups((prev) => prev.filter((_, index) => index !== groupIndex))}>
                          <IconifyIcon icon="bx:trash" />
                        </Button>
                      </div>
                    </Col>
                    <Col md={12}>
                      <Form.Control size="sm" placeholder="Group description" value={group.description || ''} onChange={(e) => setGroup(groupIndex, 'description', e.target.value)} />
                    </Col>
                  </Row>

                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="small text-muted">Values</span>
                    <Button type="button" size="sm" variant="soft-primary" onClick={() => setCustomizationGroups((prev) => updateAt(prev, groupIndex, (item) => ({ ...item, options: [...(item.options || []), blankOption()] })))}>
                      <IconifyIcon icon="bx:plus" className="me-1" />
                      Add Value
                    </Button>
                  </div>

                  {(group.options || []).length === 0 ? (
                    <EmptyLine>No values</EmptyLine>
                  ) : (group.options || []).map((option, optionIndex) => (
                    <OptionRow
                      key={option._id || optionIndex}
                      option={option}
                      onChange={(field, value) => setGroupOption(groupIndex, optionIndex, field, value)}
                      onDefault={(checked) => setGroupDefault(groupIndex, optionIndex, checked)}
                      onRemove={() => setCustomizationGroups((prev) => updateAt(prev, groupIndex, (item) => ({ ...item, options: (item.options || []).filter((_, index) => index !== optionIndex) })))}
                    />
                  ))}
                </Accordion.Body>
              </Accordion.Item>
            ))}
          </Accordion>
        )}
      </Col>
    </>
  );
};

export default ProductOptionsEditor;
